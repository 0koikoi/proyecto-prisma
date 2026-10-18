package com.prisma.api.application.supplier;

import com.prisma.api.application.supplier.dto.SupplierRequest;
import com.prisma.api.application.supplier.dto.SupplierResponse;
import com.prisma.api.domain.entities.Supplier;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
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
}
