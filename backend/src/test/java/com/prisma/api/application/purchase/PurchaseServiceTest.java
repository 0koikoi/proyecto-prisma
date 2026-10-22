package com.prisma.api.application.purchase;

import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.application.purchase.dto.CreatePurchaseRequest;
import com.prisma.api.application.purchase.dto.PurchaseResponse;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.domain.repository.InventoryMovementRepository;
import com.prisma.api.domain.repository.ProductVariantRepository;
import com.prisma.api.infrastructure.persistence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private PurchaseDetailRepository purchaseDetailRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private InventoryMovementRepository inventoryMovementRepository;

    @Mock
    private FinancialTransactionRepository financialTransactionRepository;

    @Mock
    private CashRegisterRepository cashRegisterRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private PurchaseService purchaseService;

    private User sampleUser;
    private Supplier sampleSupplier;
    private Product sampleProduct;
    private ProductVariant sampleVariant;

    @BeforeEach
    void setUp() {
        sampleUser = new User("admin", "hash", "Admin Meli", UserRole.ADMIN);
        sampleUser.setId(1L);

        sampleSupplier = new Supplier("Textiles Gamarra", "981234567");
        sampleSupplier.setId(10L);
        sampleSupplier.setActive(true);

        Category cat = new Category("Urbana", "Categoría urbana");
        cat.setId(1L);

        sampleProduct = new Product(cat, "Polera Urban", "Descripción de prueba", null);
        sampleProduct.setId(100L);

        sampleVariant = new ProductVariant(sampleProduct, "URB-001", "M", "Negro",
                BigDecimal.valueOf(35.00), BigDecimal.valueOf(69.90), 10);
        sampleVariant.setId(200L);
        sampleVariant.setActive(true);
    }

    @Test
    @DisplayName("Debe registrar compra, detalle, kardex y egreso financiero correctamente")
    void registerPurchaseAndRestock_success() {
        CreatePurchaseRequest request = new CreatePurchaseRequest(
                10L, 100L, 200L, 15, BigDecimal.valueOf(38.00), "F001-209", "TARJETA", "Reposición lote"
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(supplierRepository.findById(10L)).thenReturn(Optional.of(sampleSupplier));
        when(productVariantRepository.findById(200L)).thenReturn(Optional.of(sampleVariant));

        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(invocation -> {
            Purchase p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        when(purchaseDetailRepository.save(any(PurchaseDetail.class))).thenAnswer(invocation -> {
            PurchaseDetail d = invocation.getArgument(0);
            d.setId(5L);
            return d;
        });

        PurchaseResponse response = purchaseService.registerPurchaseAndRestock(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Textiles Gamarra", response.supplierName());
        assertEquals("F001-209", response.invoiceNumber());
        assertEquals(BigDecimal.valueOf(570.00).setScale(2), response.totalAmount());
        assertEquals(1, response.details().size());
        assertEquals(25, sampleVariant.getCurrentStock()); // 10 inicial + 15 recibido

        verify(productVariantRepository).save(sampleVariant);
        verify(inventoryMovementRepository).save(any(InventoryMovement.class));
        verify(financialTransactionRepository).save(any(FinancialTransaction.class));
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el proveedor no existe")
    void registerPurchaseAndRestock_supplierNotFound() {
        CreatePurchaseRequest request = new CreatePurchaseRequest(
                999L, 100L, 200L, 10, BigDecimal.valueOf(30.00), null, "TARJETA", null
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(supplierRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                purchaseService.registerPurchaseAndRestock(request)
        );
    }

    @Test
    @DisplayName("Debe rechazar compra en efectivo si no hay caja abierta")
    void registerPurchaseAndRestock_cashRequiresOpenRegister() {
        CreatePurchaseRequest request = new CreatePurchaseRequest(
                10L, 100L, 200L, 10, BigDecimal.valueOf(30.00), null, "EFECTIVO", null
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(supplierRepository.findById(10L)).thenReturn(Optional.of(sampleSupplier));
        when(productVariantRepository.findById(200L)).thenReturn(Optional.of(sampleVariant));
        when(cashRegisterRepository.findFirstByStatus(any())).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                purchaseService.registerPurchaseAndRestock(request)
        );
        assertEquals("CASH_REGISTER_CLOSED", ex.getCode());
    }
}
