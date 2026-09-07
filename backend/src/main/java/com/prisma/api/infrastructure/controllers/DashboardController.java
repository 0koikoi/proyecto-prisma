package com.prisma.api.infrastructure.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RESPONSABLE: Keila
 * MÓDULO: Dashboard
 *
 * Controlador REST para el panel principal del Dashboard.
 *
 * ENDPOINTS A IMPLEMENTAR:
 *   GET    /api/dashboard/summary       → métricas del día (ventas, ganancia, margen, caja, pedidos pendientes)
 *   GET    /api/dashboard/weekly-trend  → ventas de los últimos 7 días (para gráfico de línea)
 *   GET    /api/dashboard/by-category   → ventas del día por categoría (para gráfico de dona)
 *   GET    /api/dashboard/low-stock     → productos con stock por debajo del umbral
 *
 * TODO Keila: Inyectar DashboardUseCase.
 * TODO Keila: Implementar cada endpoint con @GetMapping.
 * TODO Keila: Acceso permitido para ADMIN y VENDEDOR (el Vendedor ve versión reducida).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    // TODO Keila: implementar los endpoints listados arriba
}
