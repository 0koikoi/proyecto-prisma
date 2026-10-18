package com.prisma.api.application.purchase;

import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.application.purchase.dto.CreatePurchaseRequest;
import com.prisma.api.application.purchase.dto.PurchaseResponse;
import com.prisma.api.application.purchase.mapper.PurchaseMapper;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.*;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final PurchaseDetailRepository purchaseDetailRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final CurrentUserProvider currentUserProvider;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            PurchaseDetailRepository purchaseDetailRepository,
            SupplierRepository supplierRepository,
            ProductVariantRepository productVariantRepository,
            InventoryMovementRepository inventoryMovementRepository,
            FinancialTransactionRepository financialTransactionRepository,
            CashRegisterRepository cashRegisterRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.purchaseRepository = purchaseRepository;
        this.purchaseDetailRepository = purchaseDetailRepository;
        this.supplierRepository = supplierRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.cashRegisterRepository = cashRegisterRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public PurchaseResponse registerPurchaseAndRestock(CreatePurchaseRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        // 1. Validar Proveedor
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", request.supplierId()));
        if (!supplier.isActive()) {
            throw new BusinessRuleException("SUPPLIER_INACTIVE", "El proveedor seleccionado no se encuentra activo");
        }

        // 2. Resolver y Validar Variante
        ProductVariant variant;
        if (request.variantId() != null) {
            variant = productVariantRepository.findById(request.variantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variante de producto", request.variantId()));
        } else if (request.productId() != null) {
            variant = productVariantRepository.findFirstByProductIdAndIsActiveTrueOrderByIdAsc(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variante para el producto", request.productId()));
        } else {
            throw new BusinessRuleException("VARIANT_REQUIRED", "Debe especificar un producto o variante a reponer");
        }

        if (!variant.isActive()) {
            throw new BusinessRuleException("VARIANT_INACTIVE", "La variante de producto seleccionada está inactiva");
        }

        // 3. Determinar método de pago
        PaymentMethod paymentMethod = parsePaymentMethod(request.paymentMethod());

        // 4. Si el pago es en efectivo, exigir caja abierta
        CashRegister openRegister = null;
        if (paymentMethod == PaymentMethod.EFECTIVO) {
            openRegister = cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)
                    .orElseThrow(() -> new BusinessRuleException(
                            "CASH_REGISTER_CLOSED",
                            "Para registrar una compra en efectivo se requiere un turno de caja abierto"
                    ));
        }

        // 5. Registrar Compra (Purchase)
        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setCreatedBy(currentUser);
        purchase.setRequestKey(UUID.randomUUID());
        purchase.setInvoiceNumber(request.invoiceNumber() != null ? request.invoiceNumber().trim() : null);
        purchase.setStatus(PurchaseStatus.RECEIVED);
        purchase.setPurchasedAt(Instant.now());
        purchase.setReceivedAt(Instant.now());
        purchase.setNotes(request.notes() != null ? request.notes().trim() : null);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        // 6. Registrar Detalle de Compra (PurchaseDetail)
        PurchaseDetail detail = new PurchaseDetail();
        detail.setPurchase(savedPurchase);
        detail.setVariant(variant);
        detail.setQuantity(request.quantity());
        detail.setUnitCost(request.costPrice());
        PurchaseDetail savedDetail = purchaseDetailRepository.save(detail);

        // 7. Actualizar Inventario (Stock Físico y Costo)
        variant.setCurrentStock(variant.getCurrentStock() + request.quantity());
        variant.setCostPrice(request.costPrice());
        productVariantRepository.save(variant);

        // 8. Trazabilidad en Kardex (InventoryMovement)
        InventoryMovement movement = new InventoryMovement();
        movement.setVariant(variant);
        movement.setCreatedBy(currentUser);
        movement.setRequestKey(UUID.randomUUID());
        movement.setMovementType(InventoryMovementType.PURCHASE_RECEIPT);
        movement.setQuantity(request.quantity()); // quantity > 0
        movement.setPurchaseDetail(savedDetail);
        movement.setReason("Recepción de compra #" + savedPurchase.getId() +
                (savedPurchase.getInvoiceNumber() != null ? " (Fact: " + savedPurchase.getInvoiceNumber() + ")" : ""));
        movement.setCreatedAt(Instant.now());
        inventoryMovementRepository.save(movement);

        // 9. Registrar Egreso Financiero (FinancialTransaction)
        BigDecimal totalAmount = request.costPrice()
                .multiply(BigDecimal.valueOf(request.quantity()))
                .setScale(2, RoundingMode.HALF_UP);

        FinancialTransaction tx = new FinancialTransaction();
        tx.setRequestKey(UUID.randomUUID());
        tx.setPurchase(savedPurchase);
        tx.setRecordedBy(currentUser);
        tx.setVerifiedBy(currentUser);
        tx.setTransactionType(FinancialTransactionType.OUT);
        tx.setAmount(totalAmount);
        tx.setPaymentMethod(paymentMethod);
        tx.setStatus(FinancialTransactionStatus.VERIFIED);
        tx.setCreatedAt(Instant.now());
        tx.setVerifiedAt(Instant.now());
        if (openRegister != null) {
            tx.setCashRegister(openRegister);
        }
        tx.setDescription("Reposición " + supplier.getCompanyName() +
                (savedPurchase.getInvoiceNumber() != null ? " Fact #" + savedPurchase.getInvoiceNumber() : ""));
        financialTransactionRepository.save(tx);

        return PurchaseMapper.toResponse(savedPurchase, List.of(savedDetail));
    }

    public List<PurchaseResponse> getAllPurchases() {
        return purchaseRepository.findAllByOrderByPurchasedAtDesc().stream()
                .map(p -> {
                    List<PurchaseDetail> details = purchaseDetailRepository.findByPurchaseId(p.getId());
                    return PurchaseMapper.toResponse(p, details);
                })
                .toList();
    }

    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra", id));
        List<PurchaseDetail> details = purchaseDetailRepository.findByPurchaseId(id);
        return PurchaseMapper.toResponse(purchase, details);
    }

    private PaymentMethod parsePaymentMethod(String method) {
        if (method == null || method.isBlank()) {
            return PaymentMethod.TARJETA;
        }
        String clean = method.trim().toUpperCase();
        if ("TRANSFERENCIA".equals(clean) || "TRANSFERENCIA_BANCARIA".equals(clean)) {
            return PaymentMethod.TARJETA;
        }
        try {
            return PaymentMethod.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return PaymentMethod.TARJETA;
        }
    }
}
