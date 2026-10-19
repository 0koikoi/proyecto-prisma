package com.prisma.api.application.supplier;

import com.prisma.api.application.supplier.dto.SupplierRequest;
import com.prisma.api.application.supplier.dto.SupplierResponse;
import com.prisma.api.domain.entities.Supplier;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.domain.repository.ProductRepository;
import com.prisma.api.infrastructure.persistence.SupplierProductRepository;
import com.prisma.api.infrastructure.persistence.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private SupplierProductRepository supplierProductRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier sampleSupplier;

    @BeforeEach
    void setUp() {
        sampleSupplier = new Supplier("Confecciones Textiles Gamarra", "981234567");
        sampleSupplier.setId(1L);
        sampleSupplier.setContactName("Jorge Mendoza");
        sampleSupplier.setTaxIdType("RUC");
        sampleSupplier.setTaxId("20601234567");
        sampleSupplier.setActive(true);
    }

    @Test
    @DisplayName("Debe listar todos los proveedores activos")
    void getAllActive() {
        when(supplierRepository.findByIsActiveTrueOrderByCompanyNameAsc())
                .thenReturn(List.of(sampleSupplier));

        List<SupplierResponse> result = supplierService.getAllActive();

        assertEquals(1, result.size());
        assertEquals("Confecciones Textiles Gamarra", result.get(0).companyName());
    }

    @Test
    @DisplayName("Debe buscar un proveedor por ID exitosamente")
    void getByIdSuccess() {
        when(supplierRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(sampleSupplier));

        SupplierResponse response = supplierService.getById(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("981234567", response.phone());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el proveedor no existe o está inactivo")
    void getByIdNotFound() {
        when(supplierRepository.findByIdAndIsActiveTrue(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supplierService.getById(99L));
    }

    @Test
    @DisplayName("Debe crear un proveedor correctamente cuando los datos son válidos")
    void createSuccess() {
        SupplierRequest request = new SupplierRequest(
                "Pet Fashion Peru",
                "Carla Davila",
                "976543210",
                "contacto@petfashion.pe",
                "Av. Iquitos 840, La Victoria",
                "RUC",
                "20509876543",
                "Proveedor de arneses"
        );

        when(supplierRepository.existsByTaxIdTypeAndTaxId("RUC", "20509876543")).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenAnswer(invocation -> {
            Supplier s = invocation.getArgument(0);
            s.setId(2L);
            return s;
        });

        SupplierResponse created = supplierService.create(request);

        assertNotNull(created);
        assertEquals(2L, created.id());
        assertEquals("Pet Fashion Peru", created.companyName());
        assertEquals("20509876543", created.taxId());
    }

    @Test
    @DisplayName("Debe rechazar la creación si taxIdType viene sin taxId")
    void createFailsWithInvalidTaxIdPair() {
        SupplierRequest request = new SupplierRequest(
                "Proveedor Invalido",
                null,
                "987654321",
                null,
                null,
                "RUC", // Viene tipo pero no número
                null,
                null
        );

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> supplierService.create(request));
        assertEquals("INVALID_TAX_ID_PAIR", ex.getCode());
        verify(supplierRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe rechazar la creación si ya existe otro proveedor con el mismo RUC")
    void createFailsWithDuplicateTaxId() {
        SupplierRequest request = new SupplierRequest(
                "Proveedor Repetido",
                null,
                "987654321",
                null,
                null,
                "RUC",
                "20601234567",
                null
        );

        when(supplierRepository.existsByTaxIdTypeAndTaxId("RUC", "20601234567")).thenReturn(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> supplierService.create(request));
        assertEquals("DUPLICATE_TAX_ID", ex.getCode());
        verify(supplierRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe dar de baja lógica al proveedor sin eliminarlo físicamente")
    void deactivateSuccess() {
        when(supplierRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(sampleSupplier));

        supplierService.deactivate(1L);

        assertFalse(sampleSupplier.isActive());
        verify(supplierRepository).save(sampleSupplier);
    }

    @Test
    @DisplayName("Debe vincular un producto al proveedor exitosamente")
    void linkProductSuccess() {
        com.prisma.api.domain.entities.Category cat = new com.prisma.api.domain.entities.Category("Ropa Urbana", "Desc");
        com.prisma.api.domain.entities.Product prod = new com.prisma.api.domain.entities.Product(cat, "Polera Oversize", "Desc", null);
        prod.setId(10L);

        when(supplierRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(sampleSupplier));
        when(productRepository.findByIdAndIsActiveTrue(10L)).thenReturn(Optional.of(prod));
        when(supplierProductRepository.findById(any())).thenReturn(Optional.empty());

        supplierService.linkProduct(1L, 10L);

        verify(supplierProductRepository).save(any(com.prisma.api.domain.entities.SupplierProduct.class));
    }

    @Test
    @DisplayName("Debe listar productos abastecidos por un proveedor")
    void getProductsBySupplierSuccess() {
        com.prisma.api.domain.entities.Category cat = new com.prisma.api.domain.entities.Category("Ropa Urbana", "Desc");
        com.prisma.api.domain.entities.Product prod = new com.prisma.api.domain.entities.Product(cat, "Polera Oversize", "Desc", null);
        prod.setId(10L);
        com.prisma.api.domain.entities.SupplierProduct sp = new com.prisma.api.domain.entities.SupplierProduct(sampleSupplier, prod);

        when(supplierRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(sampleSupplier));
        when(supplierProductRepository.findActiveBySupplierId(1L)).thenReturn(List.of(sp));

        List<com.prisma.api.application.supplier.dto.SupplierProductResponse> result = supplierService.getProductsBySupplier(1L);

        assertEquals(1, result.size());
        assertEquals("Polera Oversize", result.get(0).productName());
    }

    @Test
    @DisplayName("Debe desvincular un producto del proveedor")
    void unlinkProductSuccess() {
        com.prisma.api.domain.entities.SupplierProductId key = new com.prisma.api.domain.entities.SupplierProductId(1L, 10L);
        com.prisma.api.domain.entities.SupplierProduct sp = new com.prisma.api.domain.entities.SupplierProduct();
        sp.setActive(true);

        when(supplierRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(sampleSupplier));
        when(supplierProductRepository.findById(key)).thenReturn(Optional.of(sp));

        supplierService.unlinkProduct(1L, 10L);

        assertFalse(sp.isActive());
        verify(supplierProductRepository).save(sp);
    }
}
