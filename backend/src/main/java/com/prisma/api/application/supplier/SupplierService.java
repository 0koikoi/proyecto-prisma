package com.prisma.api.application.supplier;

import com.prisma.api.application.supplier.dto.SupplierRequest;
import com.prisma.api.application.supplier.dto.SupplierResponse;
import com.prisma.api.domain.entities.Supplier;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para la gestion de proveedores de la tienda.
 */
@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    // Retorna todos los proveedores activos
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllActive() {
        return supplierRepository.findByIsActiveTrueOrderByCompanyNameAsc()
                .stream()
                .map(SupplierResponse::fromEntity)
                .toList();
    }

    // Busca un proveedor activo por su identificador
    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        Supplier supplier = findActiveById(id);
        return SupplierResponse.fromEntity(supplier);
    }

    // Registra un nuevo proveedor validando documento unico y paridad
    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        validateTaxIdPair(request.taxIdType(), request.taxId());

        if (hasTaxId(request.taxIdType(), request.taxId())) {
            boolean exists = supplierRepository.existsByTaxIdTypeAndTaxId(
                    request.taxIdType().trim().toUpperCase(),
                    request.taxId().trim()
            );
            if (exists) {
                throw new BusinessRuleException(
                        "DUPLICATE_TAX_ID",
                        "Ya existe un proveedor registrado con el documento " + request.taxId()
                );
            }
        }

        Supplier supplier = new Supplier(request.companyName().trim(), request.phone().trim());
        applyData(supplier, request);

        Supplier saved = supplierRepository.save(supplier);
        return SupplierResponse.fromEntity(saved);
    }

    // Actualiza datos de un proveedor existente
    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findActiveById(id);
        validateTaxIdPair(request.taxIdType(), request.taxId());

        if (hasTaxId(request.taxIdType(), request.taxId())) {
            boolean duplicate = supplierRepository.existsByTaxIdTypeAndTaxIdAndIdNot(
                    request.taxIdType().trim().toUpperCase(),
                    request.taxId().trim(),
                    id
            );
            if (duplicate) {
                throw new BusinessRuleException(
                        "DUPLICATE_TAX_ID",
                        "Ya existe otro proveedor registrado con el documento " + request.taxId()
                );
            }
        }

        applyData(supplier, request);
        Supplier updated = supplierRepository.save(supplier);
        return SupplierResponse.fromEntity(updated);
    }

    // Baja logica del proveedor (RN15: conserva compras e historiales)
    @Transactional
    public void deactivate(Long id) {
        Supplier supplier = findActiveById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    // Busca la entidad activa o lanza excepcion amigable
    private Supplier findActiveById(Long id) {
        return supplierRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
    }

    // Valida que tipo y numero de documento se ingresen juntos o ambos queden vacios
    private void validateTaxIdPair(String taxIdType, String taxId) {
        boolean hasType = taxIdType != null && !taxIdType.trim().isEmpty();
        boolean hasNumber = taxId != null && !taxId.trim().isEmpty();

        if (hasType != hasNumber) {
            throw new BusinessRuleException(
                    "INVALID_TAX_ID_PAIR",
                    "El tipo de documento (RUC/DNI) y el número de documento deben proporcionarse juntos"
            );
        }
    }

    private boolean hasTaxId(String taxIdType, String taxId) {
        return taxIdType != null && !taxIdType.trim().isEmpty() && taxId != null && !taxId.trim().isEmpty();
    }

    private void applyData(Supplier supplier, SupplierRequest request) {
        supplier.setCompanyName(request.companyName().trim());
        supplier.setContactName(request.contactName() != null ? request.contactName().trim() : null);
        supplier.setPhone(request.phone().trim());
        supplier.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        supplier.setAddress(request.address() != null ? request.address().trim() : null);
        supplier.setNotes(request.notes() != null ? request.notes().trim() : null);

        if (hasTaxId(request.taxIdType(), request.taxId())) {
            supplier.setTaxIdType(request.taxIdType().trim().toUpperCase());
            supplier.setTaxId(request.taxId().trim());
        } else {
            supplier.setTaxIdType(null);
            supplier.setTaxId(null);
        }
    }
}
