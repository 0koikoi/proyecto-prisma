package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Repositorio de Product.
 *
 * TODO Mauricio: Descomentar y completar los métodos de búsqueda una vez
 *   que la entidad Product tenga sus campos definidos. Métodos sugeridos:
 *
 *   - List<Product> findByCategoryId(Long categoryId)
 *     → Para filtrar inventario por línea (Femenina / Urbana / Mascotas)
 *
 *   - Optional<Product> findBySku(String sku)
 *     → Para buscar en el POS por SKU corto
 *
 *   - Optional<Product> findByBarcode(String barcode)
 *     → Para búsqueda por código de barras en el POS (scanner USB)
 *
 *   - List<Product> findByCurrentStockLessThanEqualAndIsActiveTrue(Integer threshold)
 *     → Para la alerta de stock bajo en Dashboard (RF05)
 *
 *   - List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku)
 *     → Buscador de texto libre en el POS
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    // TODO Mauricio: descomentar los métodos según se vayan necesitando
}