package com.prisma.api.infrastructure.web;

import com.prisma.api.application.cash.CashRegisterService;
import com.prisma.api.application.cash.dto.CashRegisterStatusResponse;
import com.prisma.api.application.cash.dto.CloseCashRegisterRequest;
import com.prisma.api.application.cash.dto.CloseCashRegisterResponse;
import com.prisma.api.application.cash.dto.OpenCashRegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cash-register")
public class CashRegisterController {

    private final CashRegisterService cashRegisterService;

    public CashRegisterController(CashRegisterService cashRegisterService) {
        this.cashRegisterService = cashRegisterService;
    }

    @GetMapping("/status")
    public ResponseEntity<CashRegisterStatusResponse> status() {
        return ResponseEntity.ok(cashRegisterService.getStatus());
    }

    @PostMapping("/open")
    public ResponseEntity<CashRegisterStatusResponse> open(@Valid @RequestBody OpenCashRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cashRegisterService.open(request));
    }

    @PostMapping("/close")
    public ResponseEntity<CloseCashRegisterResponse> close(@Valid @RequestBody CloseCashRegisterRequest request) {
        return ResponseEntity.ok(cashRegisterService.close(request));
    }
}
