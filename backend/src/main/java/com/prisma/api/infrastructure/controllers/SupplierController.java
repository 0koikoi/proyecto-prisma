package com.prisma.api.infrastructure.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores (REST Controller)
 *
 * Endpoints HTTP para directorio de talleres/distribuidores y reposición de inventario:
 *  - GET  /api/suppliers        -> Listar proveedores
 *  - POST /api/suppliers        -> Registrar nuevo proveedor
 *  - PUT  /api/suppliers/{id}   -> Actualizar datos de proveedor
 *  - POST /api/purchases        -> Registrar reposición de mercadería (RF19)
 *
 * TODO Zully:
 *  - Inyectar SupplierUseCase o SupplierRepository.
 */
@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    @GetMapping
    public ResponseEntity<?> getAllSuppliers() {
        // TODO Zully: llamar a supplierUseCase.getAllSuppliers()
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", 1,
                "companyName", "Confecciones Textiles Gamarra S.A.C.",
                "contactName", "Jorge Mendoza",
                "phone", "981234567",
                "email", "ventas@textilesgamarra.pe",
                "taxId", "20601234567"
            ),
            Map.of(
                "id", 2,
                "companyName", "Pet Fashion Perú",
                "contactName", "Carla Dávila",
                "phone", "976543210",
                "email", "contacto@petfashion.pe",
                "taxId", "20509876543"
            )
        ));
    }

    @PostMapping
    public ResponseEntity<?> createSupplier(@RequestBody Map<String, Object> payload) {
        // TODO Zully: llamar a supplierUseCase.createSupplier(request)
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Proveedor registrado correctamente",
            "data", payload
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        // TODO Zully: llamar a supplierUseCase.updateSupplier(id, request)
        return ResponseEntity.ok(Map.of(
            "success", true,
            "id", id,
            "data", payload
        ));
    }
}
