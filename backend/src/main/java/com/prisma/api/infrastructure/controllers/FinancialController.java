package com.prisma.api.infrastructure.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RESPONSABLE: Meli
 * MÓDULO: Reporte Financiero
 *
 * Controlador REST para el reporte financiero histórico y exportaciones.
 *
 * ENDPOINTS A IMPLEMENTAR:
 *   GET    /api/finance/summary                      → balance de período (ingresos, egresos, ganancia, margen)
 *   GET    /api/finance/transactions                 → libro diario de transacciones
 *   GET    /api/finance/transactions?type=INGRESO    → solo ingresos
 *   GET    /api/finance/transactions?type=EGRESO     → solo egresos
 *   GET    /api/finance/export/csv                   → exportar transacciones a CSV (RF21)
 *
 *   Parámetros comunes de query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * TODO Meli: Inyectar FinancialReportUseCase.
 * TODO Meli: Implementar cada endpoint con @GetMapping.
 * TODO Meli: Acceso restringido solo a rol ADMIN (el Vendedor no tiene acceso, HU02).
 */
@RestController
@RequestMapping("/api/finance")
public class FinancialController {
    // TODO Meli: implementar los endpoints listados arriba
}
