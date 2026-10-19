package com.prisma.api.application.sale;

import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.application.sale.dto.CreateSaleRequest;
import com.prisma.api.application.sale.dto.DiscountRequest;
import com.prisma.api.application.sale.dto.DiscountType;
import com.prisma.api.application.sale.dto.SaleItemRequest;
import com.prisma.api.application.sale.dto.SaleResponse;
import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.entities.InventoryMovement;
import com.prisma.api.domain.entities.Product;
import com.prisma.api.domain.entities.ProductVariant;
import com.prisma.api.domain.entities.Sale;
import com.prisma.api.domain.entities.SaleDetail;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.CashRegisterStatus;
import com.prisma.api.domain.enums.FinancialTransactionStatus;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.enums.InventoryMovementType;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.domain.repository.InventoryMovementRepository;
import com.prisma.api.domain.repository.ProductVariantRepository;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import com.prisma.api.infrastructure.persistence.SaleDetailRepository;
import com.prisma.api.infrastructure.persistence.SaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private SaleDetailRepository saleDetailRepository;
    @Mock
    private CashRegisterRepository cashRegisterRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private InventoryMovementRepository inventoryMovementRepository;
    @Mock
    private FinancialTransactionRepository financialTransactionRepository;
    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private SaleService saleService;

    private User user;
    private CashRegister register;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        user = new User("vendedor", "hash", "Leo Vendedor", UserRole.VENDEDOR);
        user.setId(2L);

        register = new CashRegister(user, new BigDecimal("100.00"));
        register.setId(10L);

        Product product = new Product();
        product.setName("Polera Oversize");
        variant = new ProductVariant(product, "URB-001", "UNICA", "SIN_COLOR",
                new BigDecimal("30.0000"), new BigDecimal("50.00"), 5);
        variant.setId(1L);

        lenient().when(currentUserProvider.getCurrentUser()).thenReturn(user);
        lenient().when(saleRepository.findByRequestKey(any())).thenReturn(Optional.empty());
        lenient().when(cashRegisterRepository.findByStatusForShare(CashRegisterStatus.OPEN))
                .thenReturn(Optional.of(register));
        lenient().when(productVariantRepository.findAllByIdForUpdate(any())).thenReturn(List.of(variant));
        lenient().when(productVariantRepository.findAvailability(any()))
                .thenReturn(List.of(availability(1L, 5L)));
        lenient().when(saleRepository.saveAndFlush(any(Sale.class))).thenAnswer(inv -> {
            Sale sale = inv.getArgument(0);
            sale.setId(77L);
            return sale;
        });
        lenient().when(saleDetailRepository.save(any(SaleDetail.class))).thenAnswer(inv -> {
            SaleDetail detail = inv.getArgument(0);
            detail.setId(500L);
            return detail;
        });
        lenient().when(inventoryMovementRepository.save(any(InventoryMovement.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        lenient().when(financialTransactionRepository.save(any(FinancialTransaction.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    private static ProductVariantRepository.Availability availability(long variantId, long available) {
        return new ProductVariantRepository.Availability() {
            @Override
            public Long getVariantId() {
                return variantId;
            }

            @Override
            public Long getReservedStock() {
                return 0L;
            }

            @Override
            public Long getAvailableStock() {
                return available;
            }
        };
    }

    private CreateSaleRequest request(int quantity, DiscountRequest discount, PaymentMethod method, String cashGiven) {
        return new CreateSaleRequest(
                UUID.randomUUID(),
                List.of(new SaleItemRequest(1L, quantity)),
                discount,
                method,
                cashGiven == null ? null : new BigDecimal(cashGiven),
                null);
    }

    @Test
    @DisplayName("Una venta en efectivo descuenta stock, deja kardex y cobro verificado en la caja abierta")
    void cashSale_decrementsStock_andRecordsMovementAndPayment() {
        SaleResponse response = saleService.createSale(request(2, null, PaymentMethod.EFECTIVO, "120.00"));

        assertEquals("TK-000077", response.ticketNumber());
        assertEquals(new BigDecimal("100.00"), response.subtotal());
        assertEquals(new BigDecimal("100.00"), response.total());
        assertEquals(new BigDecimal("120.00"), response.cashGiven());
        assertEquals(new BigDecimal("20.00"), response.change());
        assertEquals(3, variant.getCurrentStock());

        ArgumentCaptor<SaleDetail> detail = ArgumentCaptor.forClass(SaleDetail.class);
        verify(saleDetailRepository).save(detail.capture());
        assertEquals(new BigDecimal("50.00"), detail.getValue().getUnitPrice());
        assertEquals(new BigDecimal("30.0000"), detail.getValue().getUnitCost());

        ArgumentCaptor<InventoryMovement> movement = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementRepository).save(movement.capture());
        assertEquals(InventoryMovementType.POS_SALE, movement.getValue().getMovementType());
        assertEquals(-2, movement.getValue().getQuantity());
        assertNotNull(movement.getValue().getSaleDetail());

        ArgumentCaptor<FinancialTransaction> payment = ArgumentCaptor.forClass(FinancialTransaction.class);
        verify(financialTransactionRepository).save(payment.capture());
        FinancialTransaction tx = payment.getValue();
        assertEquals(FinancialTransactionType.IN, tx.getTransactionType());
        assertEquals(FinancialTransactionStatus.VERIFIED, tx.getStatus());
        assertEquals(PaymentMethod.EFECTIVO, tx.getPaymentMethod());
        assertEquals(new BigDecimal("100.00"), tx.getAmount());
        assertEquals(new BigDecimal("120.00"), tx.getCashGiven());
        assertSame(register, tx.getCashRegister());
        assertSame(user, tx.getVerifiedBy());
        assertFalse(tx.getVerifiedAt().isBefore(tx.getCreatedAt()));
    }

    @Test
    @DisplayName("Un descuento porcentual se calcula en el servidor y el pago digital no registra efectivo entregado")
    void percentDiscount_isComputedByServer_andDigitalPaymentHasNoCashGiven() {
        SaleResponse response = saleService.createSale(
                request(2, new DiscountRequest(DiscountType.PERCENT, new BigDecimal("10")), PaymentMethod.YAPE, "999"));

        assertEquals(new BigDecimal("10.00"), response.discount());
        assertEquals(new BigDecimal("90.00"), response.total());
        assertNull(response.cashGiven());
        assertEquals(new BigDecimal("0.00"), response.change());

        ArgumentCaptor<FinancialTransaction> payment = ArgumentCaptor.forClass(FinancialTransaction.class);
        verify(financialTransactionRepository).save(payment.capture());
        assertEquals(new BigDecimal("90.00"), payment.getValue().getAmount());
        assertNull(payment.getValue().getCashGiven());
    }

    @Test
    @DisplayName("Sin turno de caja abierto no se registra la venta (RN08)")
    void rejects_whenNoOpenRegister() {
        when(cashRegisterRepository.findByStatusForShare(CashRegisterStatus.OPEN)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> saleService.createSale(request(1, null, PaymentMethod.YAPE, null)));

        assertEquals("NO_OPEN_CASH_REGISTER", ex.getCode());
        verify(saleRepository, never()).saveAndFlush(any());
        assertEquals(5, variant.getCurrentStock());
    }

    @Test
    @DisplayName("No vende más unidades que las disponibles, descontando las reservadas por pedidos (RN02)")
    void rejects_whenAvailableStockIsNotEnough() {
        when(productVariantRepository.findAvailability(any())).thenReturn(List.of(availability(1L, 1L)));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> saleService.createSale(request(2, null, PaymentMethod.YAPE, null)));

        assertEquals("INSUFFICIENT_STOCK", ex.getCode());
        verify(saleRepository, never()).saveAndFlush(any());
        verify(financialTransactionRepository, never()).save(any());
        assertEquals(5, variant.getCurrentStock());
    }

    @Test
    @DisplayName("El efectivo entregado no puede ser menor al total")
    void rejects_whenCashGivenIsLessThanTotal() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> saleService.createSale(request(1, null, PaymentMethod.EFECTIVO, "49.99")));

        assertEquals("INSUFFICIENT_CASH_GIVEN", ex.getCode());
        verify(saleRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Un descuento mayor al subtotal se rechaza")
    void rejects_whenDiscountExceedsSubtotal() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> saleService.createSale(request(1, new DiscountRequest(DiscountType.AMOUNT, new BigDecimal("60.00")),
                        PaymentMethod.YAPE, null)));

        assertEquals("INVALID_DISCOUNT", ex.getCode());
    }

    @Test
    @DisplayName("Una venta cuyo total queda en cero se rechaza")
    void rejects_whenTotalIsZero() {
        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> saleService.createSale(request(1, new DiscountRequest(DiscountType.PERCENT, new BigDecimal("100")),
                        PaymentMethod.YAPE, null)));

        assertEquals("INVALID_SALE_TOTAL", ex.getCode());
    }

    @Test
    @DisplayName("Una variante inexistente responde 404")
    void rejects_whenVariantDoesNotExist() {
        when(productVariantRepository.findAllByIdForUpdate(any())).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class,
                () -> saleService.createSale(request(1, null, PaymentMethod.YAPE, null)));
    }

    @Test
    @DisplayName("Una variante dada de baja no se puede vender")
    void rejects_whenVariantIsInactive() {
        variant.setActive(false);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> saleService.createSale(request(1, null, PaymentMethod.YAPE, null)));

        assertEquals("PRODUCT_INACTIVE", ex.getCode());
    }

    @Test
    @DisplayName("Las líneas repetidas de una misma variante se unen en un solo detalle")
    void mergesDuplicateLines() {
        CreateSaleRequest duplicated = new CreateSaleRequest(
                UUID.randomUUID(),
                List.of(new SaleItemRequest(1L, 1), new SaleItemRequest(1L, 2)),
                null, PaymentMethod.YAPE, null, null);

        SaleResponse response = saleService.createSale(duplicated);

        assertEquals(1, response.items().size());
        assertEquals(3, response.items().get(0).quantity());
        assertEquals(new BigDecimal("150.00"), response.total());
        assertEquals(2, variant.getCurrentStock());
        verify(saleDetailRepository, times(1)).save(any(SaleDetail.class));
    }

    @Test
    @DisplayName("Reintentar con el mismo requestKey devuelve la venta original sin duplicar stock ni cobro (RNF05)")
    void replayWithSameRequestKey_returnsOriginalSale() {
        UUID key = UUID.randomUUID();
        Sale existing = new Sale("TK-000042", register, user, null, BigDecimal.ZERO);
        existing.setId(42L);
        existing.setRequestKey(key);
        SaleDetail detail = new SaleDetail(existing, variant, 1, new BigDecimal("50.00"), new BigDecimal("30.0000"));
        FinancialTransaction payment = new FinancialTransaction(user, FinancialTransactionType.IN,
                new BigDecimal("50.00"), PaymentMethod.YAPE);
        when(saleRepository.findByRequestKey(key)).thenReturn(Optional.of(existing));
        when(saleDetailRepository.findBySaleIdOrderByIdAsc(42L)).thenReturn(List.of(detail));
        when(financialTransactionRepository.findBySaleId(42L)).thenReturn(List.of(payment));

        SaleResponse response = saleService.createSale(new CreateSaleRequest(
                key, List.of(new SaleItemRequest(1L, 1)), null, PaymentMethod.YAPE, null, null));

        assertEquals("TK-000042", response.ticketNumber());
        assertEquals(new BigDecimal("50.00"), response.total());
        assertEquals(5, variant.getCurrentStock());
        verify(saleRepository, never()).saveAndFlush(any());
        verify(financialTransactionRepository, never()).save(any());
        verify(inventoryMovementRepository, never()).save(any());
    }
}
