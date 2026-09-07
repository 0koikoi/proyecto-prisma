package com.prisma.api.infrastructure.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Controlador REST para ventas presenciales y caja diaria.
 *
 * ENDPOINTS A IMPLEMENTAR:
 *   POST   /api/sales                          → procesar venta (@Transactional)
 *   GET    /api/sales/cash-register/{id}       → ventas de una caja
 *   GET    /api/sales?from={date}&to={date}    → ventas por rango de fechas
 *
 *   GET    /api/cash-register/active           → caja abierta actualmente
 *   POST   /api/cash-register/open             → abrir caja del turno
 *   POST   /api/cash-register/{id}/close       → cerrar caja con cuadre
 *
 * TODO Leo: Inyectar SaleUseCase y CashRegisterUseCase.
 * TODO Leo: Implementar cada endpoint con sus anotaciones.
 * TODO Leo: El endpoint POST /api/sales debe retornar 400 si el stock es insuficiente.
 */
@RestController
@RequestMapping("/api")
public class SaleController {
    // TODO Leo: implementar los endpoints listados arriba
}
