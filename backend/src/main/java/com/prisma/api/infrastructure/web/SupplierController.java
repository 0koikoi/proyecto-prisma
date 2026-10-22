package com.prisma.api.infrastructure.web;

import com.prisma.api.application.supplier.SupplierService;
import com.prisma.api.application.supplier.dto.SupplierRequest;
import com.prisma.api.application.supplier.dto.SupplierResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el directorio de proveedores de la tienda.
 */
@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    // Listar todos los proveedores activos
    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAll() {
        List<SupplierResponse> suppliers = supplierService.getAllActive();
        return ResponseEntity.ok(suppliers);
    }

    // Obtener un proveedor por su ID
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Long id) {
        SupplierResponse supplier = supplierService.getById(id);
        return ResponseEntity.ok(supplier);
    }

    // Registrar un nuevo proveedor
    @PostMapping
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse created = supplierService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Actualizar datos de un proveedor existente
    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request
    ) {
        SupplierResponse updated = supplierService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    // Dar de baja logica a un proveedor
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        supplierService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    // Listar productos abastecidos por el proveedor
    @GetMapping("/{id}/products")
    public ResponseEntity<List<com.prisma.api.application.supplier.dto.SupplierProductResponse>> getProducts(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(supplierService.getProductsBySupplier(id));
    }

    // Asociar producto al proveedor
    @PutMapping("/{id}/products/{productId}")
    public ResponseEntity<Void> linkProduct(
            @PathVariable Long id,
            @PathVariable Long productId
    ) {
        supplierService.linkProduct(id, productId);
        return ResponseEntity.noContent().build();
    }

    // Desvincular producto del proveedor
    @DeleteMapping("/{id}/products/{productId}")
    public ResponseEntity<Void> unlinkProduct(
            @PathVariable Long id,
            @PathVariable Long productId
    ) {
        supplierService.unlinkProduct(id, productId);
        return ResponseEntity.noContent().build();
    }
}
