package com.prisma.api.application.sale;

import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.application.sale.dto.CreateSaleRequest;
import com.prisma.api.application.sale.dto.DiscountRequest;
import com.prisma.api.application.sale.dto.DiscountType;
import com.prisma.api.application.sale.dto.SaleItemRequest;
import com.prisma.api.application.sale.dto.SaleResponse;
import com.prisma.api.application.sale.mapper.SaleMapper;
import com.prisma.api.application.sale.mapper.VariantLabel;
import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.entities.InventoryMovement;
import com.prisma.api.domain.entities.ProductVariant;
import com.prisma.api.domain.entities.Sale;
import com.prisma.api.domain.entities.SaleDetail;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.CashRegisterStatus;
import com.prisma.api.domain.enums.FinancialTransactionStatus;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.enums.InventoryMovementType;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import com.prisma.api.infrastructure.persistence.InventoryMovementRepository;
import com.prisma.api.infrastructure.persistence.ProductVariantRepository;
import com.prisma.api.infrastructure.persistence.SaleDetailRepository;
import com.prisma.api.infrastructure.persistence.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Venta de mostrador en una sola transacción: valida turno y stock, registra la venta y sus líneas,
 * descuenta el inventario, deja el movimiento de kardex y el cobro verificado del turno (RF10, RF11, RF13).
 */
@Service
public class SaleService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final SaleRepository saleRepository;
    private final SaleDetailRepository saleDetailRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public SaleService(SaleRepository saleRepository,
                       SaleDetailRepository saleDetailRepository,
                       CashRegisterRepository cashRegisterRepository,
                       ProductVariantRepository productVariantRepository,
                       InventoryMovementRepository inventoryMovementRepository,
                       FinancialTransactionRepository financialTransactionRepository,
                       CurrentUserProvider currentUserProvider) {
        this.saleRepository = saleRepository;
        this.saleDetailRepository = saleDetailRepository;
        this.cashRegisterRepository = cashRegisterRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public SaleResponse createSale(CreateSaleRequest request) {
        // Reintento del mismo cobro: se devuelve la venta original sin tocar stock ni caja (RNF05).
        var replay = saleRepository.findByRequestKey(request.requestKey());
        if (replay.isPresent()) {
            return replayOf(replay.get());
        }

        CashRegister register = cashRegisterRepository.findByStatusForShare(CashRegisterStatus.OPEN)
                .orElseThrow(() -> new BusinessRuleException(
                        "NO_OPEN_CASH_REGISTER", "Debes abrir el turno de caja antes de registrar ventas"));

        Map<Long, Integer> quantities = mergeLines(request.items());
        Map<Long, ProductVariant> variants = lockVariants(quantities.keySet());
        validateStock(quantities, variants);

        BigDecimal subtotal = subtotalOf(quantities, variants);
        BigDecimal discount = discountOf(request.discount(), subtotal);
        BigDecimal total = subtotal.subtract(discount);
        if (total.signum() <= 0) {
            throw new BusinessRuleException("INVALID_SALE_TOTAL", "El total de la venta debe ser mayor a S/ 0.00");
        }
        BigDecimal cashGiven = cashGivenOf(request.paymentMethod(), request.cashGiven(), total);

        User user = currentUserProvider.getCurrentUser();
        Instant now = Instant.now();

        // El número de ticket definitivo se deriva del id; mientras tanto se usa la clave de la operación, que es única.
        Sale sale = new Sale("TK-" + request.requestKey(), register, user, blankToNull(request.customerName()), discount);
        sale.setRequestKey(request.requestKey());
        sale.setCreatedAt(now);
        sale = saleRepository.saveAndFlush(sale);
        sale.setTicketNumber(String.format("TK-%06d", sale.getId()));

        List<SaleDetail> details = new ArrayList<>();
        for (Map.Entry<Long, Integer> line : quantities.entrySet()) {
            ProductVariant variant = variants.get(line.getKey());
            int quantity = line.getValue();

            SaleDetail detail = saleDetailRepository.save(
                    new SaleDetail(sale, variant, quantity, variant.getSalePrice(), variant.getCostPrice()));
            details.add(detail);

            variant.setCurrentStock(variant.getCurrentStock() - quantity);

            InventoryMovement movement = new InventoryMovement(
                    variant, user, InventoryMovementType.POS_SALE, -quantity, null);
            movement.setSaleDetail(detail);
            inventoryMovementRepository.save(movement);
        }

        FinancialTransaction payment = new FinancialTransaction(
                user, FinancialTransactionType.IN, total, request.paymentMethod());
        payment.setSale(sale);
        payment.setCashRegister(register);
        payment.setCashGiven(cashGiven);
        payment.setStatus(FinancialTransactionStatus.VERIFIED);
        payment.setVerifiedBy(user);
        payment.setCreatedAt(now);
        payment.setVerifiedAt(now);
        payment = financialTransactionRepository.save(payment);

        return SaleMapper.toResponse(sale, details, payment);
    }

    private SaleResponse replayOf(Sale sale) {
        List<SaleDetail> details = saleDetailRepository.findBySaleIdOrderByIdAsc(sale.getId());
        FinancialTransaction payment = SaleMapper.primaryPayment(
                sale, financialTransactionRepository.findBySaleId(sale.getId()));
        return SaleMapper.toResponse(sale, details, payment);
    }

    /** Une líneas repetidas de una variante y las ordena por id para bloquear siempre en el mismo orden. */
    private static Map<Long, Integer> mergeLines(List<SaleItemRequest> items) {
        Map<Long, Integer> merged = new TreeMap<>();
        for (SaleItemRequest item : items) {
            merged.merge(item.variantId(), item.quantity(), Integer::sum);
        }
        return merged;
    }

    private Map<Long, ProductVariant> lockVariants(Set<Long> ids) {
        Map<Long, ProductVariant> found = productVariantRepository.findAllByIdForUpdate(ids).stream()
                .collect(Collectors.toMap(ProductVariant::getId, Function.identity()));
        for (Long id : ids) {
            if (!found.containsKey(id)) {
                throw new ResourceNotFoundException("Variante de producto", id);
            }
        }
        return found;
    }

    private void validateStock(Map<Long, Integer> quantities, Map<Long, ProductVariant> variants) {
        Map<Long, Long> available = productVariantRepository.findAvailability(quantities.keySet()).stream()
                .collect(Collectors.toMap(
                        ProductVariantRepository.Availability::getVariantId,
                        ProductVariantRepository.Availability::getAvailableStock));

        for (Map.Entry<Long, Integer> line : quantities.entrySet()) {
            ProductVariant variant = variants.get(line.getKey());
            if (!variant.isActive()) {
                throw new BusinessRuleException("PRODUCT_INACTIVE",
                        "\"" + VariantLabel.of(variant) + "\" está dado de baja y no se puede vender");
            }
            long sellable = available.getOrDefault(variant.getId(), (long) variant.getCurrentStock());
            if (sellable < line.getValue()) {
                throw new BusinessRuleException("INSUFFICIENT_STOCK",
                        "Stock insuficiente de \"" + VariantLabel.of(variant) + "\": disponibles "
                                + Math.max(sellable, 0) + ", solicitadas " + line.getValue());
            }
        }
    }

    private static BigDecimal subtotalOf(Map<Long, Integer> quantities, Map<Long, ProductVariant> variants) {
        return quantities.entrySet().stream()
                .map(line -> variants.get(line.getKey()).getSalePrice()
                        .multiply(BigDecimal.valueOf(line.getValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal discountOf(DiscountRequest discount, BigDecimal subtotal) {
        if (discount == null) {
            return BigDecimal.ZERO.setScale(2);
        }
        BigDecimal amount;
        if (discount.type() == DiscountType.PERCENT) {
            if (discount.value().compareTo(ONE_HUNDRED) > 0) {
                throw new BusinessRuleException("INVALID_DISCOUNT", "El descuento no puede superar el 100%");
            }
            amount = subtotal.multiply(discount.value()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        } else {
            amount = discount.value().setScale(2, RoundingMode.HALF_UP);
        }
        if (amount.compareTo(subtotal) > 0) {
            throw new BusinessRuleException("INVALID_DISCOUNT", "El descuento no puede superar el subtotal de la venta");
        }
        return amount;
    }

    /** Solo el efectivo registra monto entregado (el vuelto se deriva); Yape, Plin y tarjeta cobran el total exacto. */
    private static BigDecimal cashGivenOf(PaymentMethod method, BigDecimal cashGiven, BigDecimal total) {
        if (method != PaymentMethod.EFECTIVO) {
            return null;
        }
        BigDecimal given = cashGiven == null ? total : cashGiven.setScale(2, RoundingMode.HALF_UP);
        if (given.compareTo(total) < 0) {
            throw new BusinessRuleException("INSUFFICIENT_CASH_GIVEN",
                    "El efectivo entregado (S/ " + given + ") no cubre el total (S/ " + total + ")");
        }
        return given;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
