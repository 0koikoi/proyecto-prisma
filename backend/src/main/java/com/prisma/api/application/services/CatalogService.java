package com.prisma.api.application.services;

import com.prisma.api.application.dto.catalog.CatalogDtos.*;
import com.prisma.api.application.security.CatalogActor;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.ReservationStatus;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.repository.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@Service
@Transactional(readOnly = true)
public class CatalogService {
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final CatalogActor actor;
    private final CatalogLocks locks;

    public CatalogService(CategoryRepository categories, ProductRepository products,
                          ProductVariantRepository variants, CatalogActor actor, CatalogLocks locks) {
        this.categories = categories;
        this.products = products;
        this.variants = variants;
        this.actor = actor;
        this.locks = locks;
    }

    public PageResponse<CategoryResponse> listCategories(Boolean active, String q, int page, int size) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        String search = search(q);
        Specification<Category> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isActive"), !admin || active == null || active));
            if (search != null) predicates.add(cb.like(cb.lower(root.get("name")), search, '\\'));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return response(categories.findAll(spec, paging(page, size)), this::categoryResponse);
    }

    public CategoryResponse getCategory(Long id) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        Category category = category(id);
        if (!admin && !category.isActive()) throw missing("Categoría");
        return categoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        actor.requireAdmin();
        String name = requiredText(request.name(), 100, "nombre");
        uniqueCategory(name, -1L);
        Category category = new Category(name, optionalText(request.description()));
        return categoryResponse(categories.saveAndFlush(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        actor.requireAdmin();
        Category category = categories.findLockedById(id).orElseThrow(() -> missing("Categoría"));
        String name = requiredText(request.name(), 100, "nombre");
        uniqueCategory(name, id);
        category.setName(name);
        category.setDescription(optionalText(request.description()));
        return categoryResponse(categories.saveAndFlush(category));
    }

    @Transactional
    public CategoryResponse setCategoryActive(Long id, boolean active) {
        actor.requireAdmin();
        Category category = categories.findLockedById(id).orElseThrow(() -> missing("Categoría"));
        if (!active && products.existsByCategoryIdAndIsActiveTrue(id)) {
            throw conflict("La categoría tiene productos activos; reasígnalos o desactívalos primero.");
        }
        category.setActive(active);
        return categoryResponse(categories.saveAndFlush(category));
    }

    public PageResponse<ProductResponse> listProducts(Long categoryId, Boolean active, String q, int page, int size) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        String search = search(q);
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Predicate enabled = cb.and(cb.isTrue(root.get("isActive")), cb.isTrue(root.get("category").get("isActive")));
            predicates.add(!admin || active == null || active ? enabled : cb.not(enabled));
            if (categoryId != null) predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            if (search != null) {
                Subquery<Long> matches = query.subquery(Long.class);
                Root<ProductVariant> variant = matches.from(ProductVariant.class);
                matches.select(variant.get("id")).where(cb.equal(variant.get("product"), root),
                        cb.or(cb.like(cb.lower(variant.get("sku")), search, '\\'),
                                cb.like(cb.lower(variant.get("barcode")), search, '\\')));
                predicates.add(cb.or(cb.like(cb.lower(root.get("name")), search, '\\'), cb.exists(matches)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return response(products.findAll(spec, paging(page, size)), this::productResponse);
    }

    public ProductResponse getProduct(Long id) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        Product product = product(id);
        if (!admin && !enabled(product)) throw missing("Producto");
        return productResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        actor.requireAdmin();
        Category category = activeCategoryLocked(request.categoryId());
        Product product = new Product(category, requiredText(request.name(), 150, "nombre"),
                optionalText(request.description()), imageUrl(request.imageUrl()));
        return productResponse(products.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        actor.requireAdmin();
        CatalogLocks.CategoryChange change = locks.lockProductForCategoryChange(id, request.categoryId());
        Category category = change.category();
        Product product = change.product();
        if (!category.isActive()) throw conflict("La categoría está inactiva.");
        product.setCategory(category);
        product.setName(requiredText(request.name(), 150, "nombre"));
        product.setDescription(optionalText(request.description()));
        product.setImageUrl(imageUrl(request.imageUrl()));
        return productResponse(products.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse setProductActive(Long id, boolean active) {
        actor.requireAdmin();
        Product product = locks.lockProduct(id);
        if (active && !product.getCategory().isActive()) throw conflict("La categoría está inactiva.");
        if (!active) {
            // Include inactive variants: historical reservations must also block deactivation.
            // Lock every child in ID order before checking reservations, as reservation writers
            // serialize on the variant too. The parent lock prevents concurrent variant creation.
            variants.findLockedByProductId(id);
            if (variants.countActiveProductReservations(id) > 0) {
                throw conflict("El producto tiene reservas activas.");
            }
        }
        product.setActive(active);
        return productResponse(products.saveAndFlush(product));
    }

    public PageResponse<VariantResponse> listVariants(Long productId, Long categoryId, Boolean active,
                                                      Boolean lowStock, String q, int page, int size) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        String search = search(q);
        Specification<ProductVariant> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Predicate enabled = cb.and(cb.isTrue(root.get("isActive")), cb.isTrue(root.get("product").get("isActive")),
                    cb.isTrue(root.get("product").get("category").get("isActive")));
            predicates.add(!admin || active == null || active ? enabled : cb.not(enabled));
            if (productId != null) predicates.add(cb.equal(root.get("product").get("id"), productId));
            if (categoryId != null) predicates.add(cb.equal(root.get("product").get("category").get("id"), categoryId));
            if (search != null) predicates.add(cb.or(
                    cb.like(cb.lower(root.get("sku")), search, '\\'),
                    cb.like(cb.lower(root.get("barcode")), search, '\\'),
                    cb.like(cb.lower(root.get("product").get("name")), search, '\\')));
            if (lowStock != null) {
                Subquery<Long> reserved = query.subquery(Long.class);
                Root<InventoryReservation> reservation = reserved.from(InventoryReservation.class);
                reserved.select(cb.sumAsLong(reservation.get("orderDetail").get("quantity")));
                reserved.where(cb.equal(reservation.get("orderDetail").get("variant"), root),
                        cb.equal(reservation.get("status"), ReservationStatus.ACTIVE));
                Expression<Long> available = cb.diff(root.get("currentStock").as(Long.class), cb.coalesce(reserved, 0L));
                Predicate below = cb.lt(available, root.get("minStockAlert").as(Long.class));
                predicates.add(lowStock ? below : cb.not(below));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Page<ProductVariant> result = variants.findAll(spec, paging(page, size));
        Map<Long, ProductVariantRepository.Availability> stock = availability(result.getContent());
        return response(result, v -> variantResponse(v, stock.get(v.getId()), admin));
    }

    public VariantResponse getVariant(Long id) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        ProductVariant variant = variant(id);
        if (!admin && !enabled(variant)) throw missing("Variante");
        return variantResponse(variant, stock(variant), admin);
    }

    public VariantResponse findByBarcode(String barcode) {
        boolean admin = actor.requireReader().getRole() == UserRole.ADMIN;
        String normalized = requiredText(barcode, 50, "código de barras");
        ProductVariant variant = variants.findByBarcode(normalized).orElseThrow(() -> missing("Variante"));
        if (!admin && !enabled(variant)) throw missing("Variante");
        return variantResponse(variant, stock(variant), admin);
    }

    @Transactional
    public VariantResponse createVariant(Long productId, VariantRequest request) {
        actor.requireAdmin();
        Product product = locks.lockProduct(productId);
        if (!enabled(product)) throw conflict("El producto o su categoría están inactivos.");
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        applyVariant(variant, request.sku(), request.barcode(), request.sizeLabel(), request.colorLabel(),
                request.costPrice(), request.salePrice(), request.minStockAlert());
        // Initial stock is always zero. Opening balances use an audited adjustment.
        // A versioned entity can be merged; use the managed instance carrying its generated ID.
        variant = variants.saveAndFlush(variant);
        return variantResponse(variant, stock(variant), true);
    }

    @Transactional
    public VariantResponse updateVariant(Long id, VariantUpdateRequest request) {
        actor.requireAdmin();
        ProductVariant variant = locks.lockVariant(id);
        if (!Objects.equals(variant.getVersion(), request.version())) {
            throw conflict("La variante cambió. Recarga sus datos antes de guardar.");
        }
        applyVariant(variant, request.sku(), request.barcode(), request.sizeLabel(), request.colorLabel(),
                request.costPrice(), request.salePrice(), request.minStockAlert());
        variants.saveAndFlush(variant);
        return variantResponse(variant, stock(variant), true);
    }

    @Transactional
    public VariantResponse setVariantActive(Long id, boolean active) {
        actor.requireAdmin();
        ProductVariant variant = locks.lockVariant(id);
        if (active && !enabled(variant.getProduct())) throw conflict("El producto o su categoría están inactivos.");
        if (!active && variants.countActiveReservations(id) > 0) throw conflict("La variante tiene reservas activas.");
        variant.setActive(active);
        variants.saveAndFlush(variant);
        return variantResponse(variant, stock(variant), true);
    }

    private void applyVariant(ProductVariant variant, String skuValue, String barcodeValue, String sizeValue,
                              String colorValue, java.math.BigDecimal cost, java.math.BigDecimal price, Integer min) {
        String sku = requiredText(skuValue, 50, "SKU").toUpperCase(Locale.ROOT);
        if (sku.length() > 50 || sku.codePoints().anyMatch(Character::isWhitespace)) {
            throw badRequest("El SKU debe tener hasta 50 caracteres y no contener espacios.");
        }
        String barcode = optionalText(barcodeValue);
        String size = normalizedLabel(sizeValue, 30, "talla");
        String color = normalizedLabel(colorValue, 50, "color");
        if (size.length() > 30 || color.length() > 50 || (barcode != null && barcode.length() > 50)) {
            throw badRequest("La talla, el color o el código de barras excede su longitud máxima.");
        }
        if (cost == null || cost.signum() < 0 || price == null || price.signum() <= 0 || min == null || min < 0) {
            throw badRequest("Costo, precio y umbral de stock no son válidos.");
        }
        Long exceptId = variant.getId() == null ? -1L : variant.getId();
        if (variants.existsBySkuIgnoreCaseAndIdNot(sku, exceptId)) throw conflict("El SKU ya está registrado.");
        if (barcode != null && variants.existsByBarcodeAndIdNot(barcode, exceptId)) throw conflict("El código de barras ya está registrado.");
        if (variants.existsByProductIdAndSizeLabelIgnoreCaseAndColorLabelIgnoreCaseAndIdNot(
                variant.getProduct().getId(), size, color, exceptId)) {
            throw conflict("Ya existe esa combinación de talla y color para el producto.");
        }
        variant.setSku(sku);
        variant.setBarcode(barcode);
        variant.setSizeLabel(size);
        variant.setColorLabel(color);
        variant.setCostPrice(cost);
        variant.setSalePrice(price);
        variant.setMinStockAlert(min);
    }

    private Category category(Long id) { return categories.findById(id).orElseThrow(() -> missing("Categoría")); }
    private Product product(Long id) { return products.findById(id).orElseThrow(() -> missing("Producto")); }
    private ProductVariant variant(Long id) { return variants.findById(id).orElseThrow(() -> missing("Variante")); }

    private Category activeCategoryLocked(Long id) {
        Category category = categories.findLockedById(id).orElseThrow(() -> missing("Categoría"));
        if (!category.isActive()) throw conflict("La categoría está inactiva.");
        return category;
    }

    private void uniqueCategory(String name, Long exceptId) {
        if (categories.existsByNameIgnoreCaseAndIdNot(name, exceptId)) throw conflict("La categoría ya está registrada.");
    }

    private boolean enabled(Product product) { return product.isActive() && product.getCategory().isActive(); }
    private boolean enabled(ProductVariant variant) { return variant.isActive() && enabled(variant.getProduct()); }

    private CategoryResponse categoryResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), category.isActive(), category.getCreatedAt());
    }

    private ProductResponse productResponse(Product product) {
        return new ProductResponse(product.getId(), product.getCategory().getId(), product.getCategory().getName(),
                product.getName(), product.getDescription(), product.getImageUrl(), enabled(product), product.getCreatedAt(), product.getUpdatedAt());
    }

    private VariantResponse variantResponse(ProductVariant variant, ProductVariantRepository.Availability availability, boolean admin) {
        Product product = variant.getProduct();
        long reserved = availability == null ? 0 : availability.getReservedStock();
        long available = (long) variant.getCurrentStock() - reserved;
        return new VariantResponse(variant.getId(), product.getId(), product.getName(), product.getCategory().getId(),
                product.getCategory().getName(), variant.getSku(), variant.getBarcode(), variant.getSizeLabel(),
                variant.getColorLabel(), admin ? variant.getCostPrice() : null, variant.getSalePrice(),
                variant.getCurrentStock(), reserved, available, variant.getMinStockAlert(), available < variant.getMinStockAlert(),
                enabled(variant), variant.getVersion());
    }

    private ProductVariantRepository.Availability stock(ProductVariant variant) {
        return variants.findAvailability(List.of(variant.getId())).stream().findFirst().orElse(null);
    }

    private Map<Long, ProductVariantRepository.Availability> availability(List<ProductVariant> list) {
        if (list.isEmpty()) return Map.of();
        return variants.findAvailability(list.stream().map(ProductVariant::getId).toList()).stream()
                .collect(Collectors.toMap(ProductVariantRepository.Availability::getVariantId, Function.identity()));
    }

    static Pageable paging(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw badRequest("La página debe ser >= 0 y el tamaño entre 1 y 100.");
        return PageRequest.of(page, size, Sort.by("id"));
    }

    static <T, R> PageResponse<R> response(Page<T> page, Function<T, R> mapper) {
        return new PageResponse<>(page.getContent().stream().map(mapper).toList(), page.getNumber(),
                page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    static String requiredText(String value, int maxLength, String field) {
        String text = optionalText(value);
        if (text == null || text.length() > maxLength) throw badRequest("El campo " + field + " es obligatorio y admite hasta " + maxLength + " caracteres.");
        return text;
    }

    static String optionalText(String value) { return value == null || value.isBlank() ? null : value.strip(); }

    private String normalizedLabel(String value, int maxLength, String field) {
        // Treat repeated spaces, tabs and Unicode spacing as the same variant label.
        String collapsed = value == null ? null : value.replaceAll("(?U)\\s+", " ");
        return requiredText(collapsed, maxLength, field).toUpperCase(Locale.ROOT);
    }

    private String search(String value) {
        String normalized = optionalText(value);
        if (normalized == null) return null;
        if (normalized.length() > 100) throw badRequest("La búsqueda admite hasta 100 caracteres.");
        return "%" + normalized.toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }

    private String imageUrl(String value) {
        String url = optionalText(value);
        if (url == null) return null;
        try {
            URI uri = URI.create(url);
            if (url.length() <= 2048 && uri.getHost() != null && uri.getUserInfo() == null
                    && ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))) return url;
        } catch (IllegalArgumentException ignored) { }
        throw badRequest("La imagen debe ser una URL HTTP o HTTPS válida de hasta 2048 caracteres.");
    }

    static ResponseStatusException missing(String entity) { return new ResponseStatusException(NOT_FOUND, entity + " no encontrada."); }
    static ResponseStatusException conflict(String message) { return new ResponseStatusException(CONFLICT, message); }
    static ResponseStatusException badRequest(String message) { return new ResponseStatusException(BAD_REQUEST, message); }
}
