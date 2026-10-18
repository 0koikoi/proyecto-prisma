package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio Spring Data JPA para las variantes de producto (talla/color/SKU).
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // Busca una variante activa por su ID con su producto principal
    @Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p WHERE v.id = :id AND v.isActive = true")
    Optional<ProductVariant> findByIdActiveWithProduct(@Param("id") Long id);

    // Busca una variante por su codigo SKU
    Optional<ProductVariant> findBySku(String sku);
}
