package com.prisma.api.infrastructure.web;

import com.prisma.api.application.sale.PosCatalogService;
import com.prisma.api.application.sale.dto.PosCatalogItemResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pos/catalog")
public class PosCatalogController {

    private final PosCatalogService posCatalogService;

    public PosCatalogController(PosCatalogService posCatalogService) {
        this.posCatalogService = posCatalogService;
    }

    @GetMapping
    public ResponseEntity<List<PosCatalogItemResponse>> catalog() {
        return ResponseEntity.ok(posCatalogService.getCatalog());
    }

    @GetMapping("/barcode/{code}")
    public ResponseEntity<PosCatalogItemResponse> byBarcode(@PathVariable String code) {
        return ResponseEntity.ok(posCatalogService.findByBarcode(code));
    }
}
