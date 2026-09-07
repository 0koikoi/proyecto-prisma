package com.prisma.api.infrastructure.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos y Proveedores
 *
 * Controlador REST para pedidos online y proveedores.
 *
 * ENDPOINTS PEDIDOS:
 *   GET    /api/orders                         → listar pedidos (filtros: status, channel)
 *   GET    /api/orders/{id}                    → detalle de un pedido
 *   POST   /api/orders                         → crear pedido nuevo
 *   PATCH  /api/orders/{id}/status             → actualizar estado del pedido
 *
 * ENDPOINTS PROVEEDORES:
 *   GET    /api/suppliers                      → listar proveedores
 *   GET    /api/suppliers/{id}                 → detalle proveedor
 *   POST   /api/suppliers                      → registrar proveedor (Admin)
 *   PUT    /api/suppliers/{id}                 → editar proveedor (Admin)
 *   GET    /api/suppliers/{id}/purchases       → historial de reposiciones
 *   POST   /api/suppliers/{id}/purchases       → registrar reposición de stock
 *
 * TODO Zully: Inyectar OrderUseCase y SupplierUseCase.
 * TODO Zully: Implementar cada endpoint con sus anotaciones.
 */
@RestController
@RequestMapping("/api")
public class OrderController {
    // TODO Zully: implementar los endpoints listados arriba
}
