package com.prisma.api.application.services;

import com.prisma.api.domain.entities.Category;
import com.prisma.api.domain.entities.Product;
import com.prisma.api.domain.entities.ProductVariant;
import com.prisma.api.domain.repository.CategoryRepository;
import com.prisma.api.domain.repository.ProductRepository;
import com.prisma.api.domain.repository.ProductVariantRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static com.prisma.api.application.services.CatalogService.conflict;
import static com.prisma.api.application.services.CatalogService.missing;

/**
 * Locks catalog parents before their children inside the caller's write transaction.
 * Look up parent identifiers as scalars so an unlocked entity cannot be reused from
 * the persistence context with stale active/category values. If a product changed
 * category while waiting, abort rather than acquire a new parent lock out of order.
 */
@Component
@Transactional(propagation = Propagation.MANDATORY)
public class CatalogLocks {
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ProductVariantRepository variants;

    public CatalogLocks(CategoryRepository categories, ProductRepository products,
                        ProductVariantRepository variants) {
        this.categories = categories;
        this.products = products;
        this.variants = variants;
    }

    public Product lockProduct(Long id) {
        Long categoryId = products.findCategoryIdById(id).orElseThrow(() -> missing("Producto"));
        categories.findLockedById(categoryId).orElseThrow(() -> missing("Categoría"));
        return productInCategory(id, categoryId);
    }

    public ProductVariant lockVariant(Long id) {
        Long productId = variants.findProductIdById(id).orElseThrow(() -> missing("Variante"));
        lockProduct(productId);
        ProductVariant variant = variants.findLockedById(id).orElseThrow(() -> missing("Variante"));
        if (!Objects.equals(variant.getProduct().getId(), productId)) {
            throw conflict("La variante cambió de producto. Recarga sus datos antes de continuar.");
        }
        return variant;
    }

    public CategoryChange lockProductForCategoryChange(Long id, Long targetCategoryId) {
        Long currentCategoryId = products.findCategoryIdById(id).orElseThrow(() -> missing("Producto"));
        Map<Long, Category> locked = new HashMap<>();
        // Sorting both categories also makes concurrent A -> B and B -> A moves safe.
        List.of(currentCategoryId, targetCategoryId).stream().distinct().sorted().forEach(categoryId ->
                locked.put(categoryId, categories.findLockedById(categoryId)
                        .orElseThrow(() -> missing("Categoría"))));
        return new CategoryChange(productInCategory(id, currentCategoryId), locked.get(targetCategoryId));
    }

    private Product productInCategory(Long id, Long expectedCategoryId) {
        Product product = products.findLockedById(id).orElseThrow(() -> missing("Producto"));
        if (!Objects.equals(product.getCategory().getId(), expectedCategoryId)) {
            throw conflict("El producto cambió de categoría. Recarga sus datos antes de continuar.");
        }
        return product;
    }

    public record CategoryChange(Product product, Category category) { }
}
