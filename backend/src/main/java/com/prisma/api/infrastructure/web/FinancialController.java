package com.prisma.api.infrastructure.web;

import com.prisma.api.application.finance.FinancialService;
import com.prisma.api.application.finance.dto.CreateFinancialTransactionRequest;
import com.prisma.api.application.finance.dto.FinancialSummaryResponse;
import com.prisma.api.application.finance.dto.FinancialTransactionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryResponse> getSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        FinancialSummaryResponse summary = financialService.getFinancialSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<FinancialTransactionResponse>> getTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        List<FinancialTransactionResponse> transactions = financialService.getTransactions(type, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transactions")
    public ResponseEntity<FinancialTransactionResponse> recordTransaction(
            @Valid @RequestBody CreateFinancialTransactionRequest request
    ) {
        FinancialTransactionResponse response = financialService.recordManualTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
