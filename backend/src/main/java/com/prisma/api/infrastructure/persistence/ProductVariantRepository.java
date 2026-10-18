package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findBySku(String sku);
    Optional<ProductVariant> findByBarcode(String barcode);
    List<ProductVariant> findByProductId(Long productId);
    Optional<ProductVariant> findFirstByProductIdAndIsActiveTrueOrderByIdAsc(Long productId);
}
