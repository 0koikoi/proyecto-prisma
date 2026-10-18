package com.prisma.api.infrastructure.web;

import com.prisma.api.application.sale.SaleQueryService;
import com.prisma.api.application.sale.SaleService;
import com.prisma.api.application.sale.dto.CreateSaleRequest;
import com.prisma.api.application.sale.dto.SaleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;
    private final SaleQueryService saleQueryService;

    public SaleController(SaleService saleService, SaleQueryService saleQueryService) {
        this.saleService = saleService;
        this.saleQueryService = saleQueryService;
    }

    /** Confirma una venta de mostrador. Repetir el mismo {@code requestKey} devuelve la venta ya registrada. */
    @PostMapping
    public ResponseEntity<SaleResponse> create(@Valid @RequestBody CreateSaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
    }

    /** Ventas del turno de caja abierto (vacía si no hay turno abierto). */
    @GetMapping
    public ResponseEntity<List<SaleResponse>> currentShift() {
        return ResponseEntity.ok(saleQueryService.listCurrentShift());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> byId(@PathVariable Long id) {
        return ResponseEntity.ok(saleQueryService.getById(id));
    }
}
