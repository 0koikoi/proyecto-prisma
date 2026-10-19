package com.prisma.api.application.sale;

import com.prisma.api.application.sale.dto.PosCatalogItemResponse;
import com.prisma.api.application.sale.mapper.PosCatalogMapper;
import com.prisma.api.domain.entities.ProductVariant;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Catálogo de solo lectura para el mostrador: variantes activas con su stock vendible (RF07, RF08). */
@Service
public class PosCatalogService {

    private final ProductVariantRepository productVariantRepository;

    public PosCatalogService(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional(readOnly = true)
    public List<PosCatalogItemResponse> getCatalog() {
        Map<Long, Long> available = productVariantRepository.findAllAvailability().stream()
                .collect(Collectors.toMap(
                        ProductVariantRepository.Availability::getVariantId,
                        ProductVariantRepository.Availability::getAvailableStock));
        return productVariantRepository.findSellableCatalog().stream()
                .map(variant -> PosCatalogMapper.toResponse(
                        variant, available.getOrDefault(variant.getId(), (long) variant.getCurrentStock())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PosCatalogItemResponse findByBarcode(String barcode) {
        ProductVariant variant = productVariantRepository.findSellableByBarcode(barcode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Producto con código de barras", barcode));
        long available = productVariantRepository.findAvailability(List.of(variant.getId())).stream()
                .findFirst()
                .map(ProductVariantRepository.Availability::getAvailableStock)
                .orElse((long) variant.getCurrentStock());
        return PosCatalogMapper.toResponse(variant, available);
    }
}
