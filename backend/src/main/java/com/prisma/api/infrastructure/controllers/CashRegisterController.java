package com.prisma.api.infrastructure.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario (REST Controller)
 *
 * Expone los endpoints HTTP para gestionar la caja del turno:
 *  - GET  /api/cash-register/status  -> Consulta si la caja está abierta y totales acumulados
 *  - POST /api/cash-register/open    -> Apertura de turno con saldo inicial (sencillo)
 *  - POST /api/cash-register/close   -> Cierre de turno y arqueo con conteo físico
 *
 * TODO Leo:
 *  - Inyectar CashRegisterUseCase o CashRegisterRepository.
 *  - Reemplazar respuestas de prueba con los DTOs finales.
 */
@RestController
@RequestMapping("/api/cash-register")
@CrossOrigin(origins = "*")
public class CashRegisterController {

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        // TODO Leo: llamar a cashRegisterUseCase.getActiveCashRegister()
        return ResponseEntity.ok(Map.of(
            "isOpen", true,
            "status", "OPEN",
            "initialCash", 100.00,
            "totalCashSales", 150.00,
            "totalYapeSales", 210.00,
            "totalPlinSales", 70.00
        ));
    }

    @PostMapping("/open")
    public ResponseEntity<?> openRegister(@RequestBody Map<String, Object> payload) {
        // TODO Leo: llamar a cashRegisterUseCase.openCashRegister(request)
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Caja abierta exitosamente"
        ));
    }

    @PostMapping("/close")
    public ResponseEntity<?> closeRegister(@RequestBody Map<String, Object> payload) {
        // TODO Leo: llamar a cashRegisterUseCase.closeCashRegister(request)
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Caja cerrada y arqueada correctamente"
        ));
    }
}
