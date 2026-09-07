package com.prisma.api.infrastructure.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Controlador REST para productos y categorías.
 *
 * ENDPOINTS A IMPLEMENTAR:
 *   GET    /api/products              → listar productos (con filtros: search, categoryId)
 *   GET    /api/products/{id}         → obtener producto por ID
 *   GET    /api/products/sku/{sku}    → buscar por SKU (POS sin escáner)
 *   GET    /api/products/barcode/{bc} → buscar por código de barras (POS con escáner USB)
 *   POST   /api/products              → crear producto (Admin)
 *   PUT    /api/products/{id}         → editar producto (Admin)
 *   DELETE /api/products/{id}         → dar de baja producto (Admin)
 *
 *   GET    /api/categories            → listar categorías
 *   POST   /api/categories            → crear categoría (Admin)
 *
 * TODO Mauricio: Inyectar ProductUseCase y CategoryUseCase.
 * TODO Mauricio: Implementar cada endpoint con @GetMapping, @PostMapping, etc.
 * TODO Mauricio: Agregar @PreAuthorize según el rol requerido (Admin/Vendedor).
 */
@RestController
@RequestMapping("/api")
public class ProductController {
    // TODO Mauricio: implementar los endpoints listados arriba
}
