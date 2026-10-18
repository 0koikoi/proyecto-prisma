package com.prisma.api;

import com.prisma.api.support.LocalPostgresTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CatalogApiIntegrationTests extends LocalPostgresTest {

    @Test
    void createsSeparateProductVariantsWithPrecisePricesAndZeroStock() throws Exception {
        var fixture = fixture();
        long second = createVariant(fixture.productId(), "URB-002", "L", "NEGRO");

        send(HttpMethod.GET, "/api/products/" + fixture.productId(), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Polera"));
        var first = variant(fixture.variantId());
        assertThat(first.get("currentStock").asInt()).isZero();
        assertThat(first.get("reservedStock").asInt()).isZero();
        assertThat(first.get("availableStock").asInt()).isZero();
        assertThat(first.get("costPrice").decimalValue()).isEqualByComparingTo("12.1234");
        assertThat(first.get("salePrice").decimalValue()).isEqualByComparingTo("25.50");
        assertThat(second).isNotEqualTo(fixture.variantId());
        assertThat(movements(fixture.variantId())).isZero();

        send(HttpMethod.GET, "/api/variants?productId=" + fixture.productId() + "&page=0&size=1", null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1));
    }

    @Test
    void editsCatalogMetadataWithoutChangingStockOrItsLedger() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 7, "Opening inventory").andExpect(status().is2xxSuccessful());
        long version = variant(fixture.variantId()).get("version").asLong();

        send(HttpMethod.PUT, "/api/categories/" + fixture.categoryId(),
                Map.of("name", "Ropa urbana", "description", "Updated category"))
                .andExpect(status().isOk());
        send(HttpMethod.PUT, "/api/products/" + fixture.productId(),
                Map.of("categoryId", fixture.categoryId(), "name", "Polera actualizada",
                        "description", "Updated product", "imageUrl", "https://example.test/new.png"))
                .andExpect(status().isOk());
        var input = variantInput("URB-001", "M", "NEGRO");
        input.put("salePrice", new BigDecimal("29.90"));
        input.put("version", version);
        send(HttpMethod.PUT, "/api/variants/" + fixture.variantId(), input).andExpect(status().isOk());

        assertThat(stock(fixture.variantId())).isEqualTo(7);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
        assertThat(variant(fixture.variantId()).get("salePrice").decimalValue()).isEqualByComparingTo("29.90");

        input.put("salePrice", new BigDecimal("30.00"));
        send(HttpMethod.PUT, "/api/variants/" + fixture.variantId(), input).andExpect(status().isConflict());
        assertThat(variant(fixture.variantId()).get("salePrice").decimalValue()).isEqualByComparingTo("29.90");
    }

    @Test
    void enforcesNormalizedCategoryAndSkuUniqueness() throws Exception {
        var fixture = fixture();
        send(HttpMethod.POST, "/api/categories", Map.of("name", "  urbana  "))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").isNotEmpty());
        long otherProduct = createProduct(fixture.categoryId(), "Otra polera");
        send(HttpMethod.POST, "/api/products/" + otherProduct + "/variants",
                variantInput("  urb-001  ", "S", "AZUL"))
                .andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM product_variants", Integer.class)).isEqualTo(1);
    }

    @Test
    void normalizesLabelsAndEmptyBarcodeAndRejectsDuplicateVariantCombination() throws Exception {
        long categoryId = createCategory("Accesorios");
        long productId = createProduct(categoryId, "Gorra");
        var input = variantInput("  acc-001  ", " unica ", "azul   marino");
        input.put("barcode", "   ");
        long id = body(send(HttpMethod.POST, "/api/products/" + productId + "/variants", input)
                .andExpect(status().isCreated())).get("id").asLong();
        var created = variant(id);
        assertThat(created.get("sku").asText()).isEqualTo("ACC-001");
        assertThat(created.get("sizeLabel").asText()).isEqualTo("UNICA");
        assertThat(created.get("colorLabel").asText()).isEqualTo("AZUL MARINO");
        assertThat(jdbc.queryForObject("SELECT barcode FROM product_variants WHERE id = ?", String.class, id)).isNull();

        send(HttpMethod.POST, "/api/products/" + productId + "/variants",
                variantInput("ACC-002", "UNICA", " AZUL MARINO ")).andExpect(status().isConflict());
        // Several variants may omit barcode; PostgreSQL nullable uniqueness permits this.
        createVariant(productId, "ACC-003", "UNICA", "ROJO");
    }

    @Test
    void rejectsDuplicateNormalizedBarcodeAcrossProducts() throws Exception {
        long categoryId = createCategory("Urbana");
        long firstProduct = createProduct(categoryId, "Primera");
        long secondProduct = createProduct(categoryId, "Segunda");
        var first = variantInput("URB-001", "S", "NEGRO");
        first.put("barcode", "7751234567890");
        send(HttpMethod.POST, "/api/products/" + firstProduct + "/variants", first).andExpect(status().isCreated());
        var second = variantInput("URB-002", "L", "BLANCO");
        second.put("barcode", "  7751234567890  ");
        send(HttpMethod.POST, "/api/products/" + secondProduct + "/variants", second).andExpect(status().isConflict());
    }

    @Test
    void preventsCategoryDeactivationWithActiveProductsAndCreationInInactiveCategory() throws Exception {
        var fixture = fixture();
        send(HttpMethod.PATCH, "/api/categories/" + fixture.categoryId() + "/active", Map.of("isActive", false))
                .andExpect(status().isConflict());
        send(HttpMethod.DELETE, "/api/products/" + fixture.productId(), null).andExpect(status().isNoContent());
        send(HttpMethod.PATCH, "/api/categories/" + fixture.categoryId() + "/active", Map.of("isActive", false))
                .andExpect(status().isOk());
        send(HttpMethod.POST, "/api/products", Map.of("categoryId", fixture.categoryId(), "name", "Forbidden"))
                .andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM products", Integer.class)).isEqualTo(1);
        send(HttpMethod.GET, "/api/variants", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void softDeleteRetainsVariantAndMovementHistory() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 3, "Initial count").andExpect(status().is2xxSuccessful());
        send(HttpMethod.DELETE, "/api/variants/" + fixture.variantId(), null).andExpect(status().isNoContent());
        assertThat(jdbc.queryForObject("SELECT is_active FROM product_variants WHERE id = ?", Boolean.class,
                fixture.variantId())).isFalse();
        assertThat(stock(fixture.variantId())).isEqualTo(3);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
        send(HttpMethod.GET, "/api/variants", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
        send(HttpMethod.PATCH, "/api/variants/" + fixture.variantId() + "/active", Map.of("isActive", true))
                .andExpect(status().isOk());
        send(HttpMethod.GET, "/api/variants", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    void filtersByCategoryQueryAndStrictLowStockThreshold() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 3, "At alert threshold").andExpect(status().is2xxSuccessful());
        long otherCategory = createCategory("Mascotas");
        long otherProduct = createProduct(otherCategory, "Chaleco canino");
        createVariant(otherProduct, "PET-001", "S", "ROJO");

        send(HttpMethod.GET, "/api/variants?categoryId=" + fixture.categoryId() + "&q=urb-001", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        send(HttpMethod.GET, "/api/variants?categoryId=" + fixture.categoryId() + "&lowStock=true", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
        adjust(fixture.variantId(), UUID.randomUUID(), -1, "Below alert threshold").andExpect(status().is2xxSuccessful());
        send(HttpMethod.GET, "/api/variants?categoryId=" + fixture.categoryId() + "&lowStock=true", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void returnsValidationNotFoundAndUnknownFieldErrorsWithoutWritingStock() throws Exception {
        send(HttpMethod.POST, "/api/categories", Map.of("name", "  "))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").isNotEmpty());
        send(HttpMethod.GET, "/api/categories/999999", null).andExpect(status().isNotFound());
        send(HttpMethod.GET, "/api/products/999999", null).andExpect(status().isNotFound());
        send(HttpMethod.GET, "/api/variants/999999", null).andExpect(status().isNotFound());
        var fixture = fixture();
        var invalid = variantInput("URB-002", "S", "AZUL");
        invalid.put("salePrice", BigDecimal.ZERO);
        send(HttpMethod.POST, "/api/products/" + fixture.productId() + "/variants", invalid)
                .andExpect(status().isBadRequest());
        invalid.put("salePrice", new BigDecimal("10.00"));
        invalid.put("minStockAlert", -1);
        send(HttpMethod.POST, "/api/products/" + fixture.productId() + "/variants", invalid)
                .andExpect(status().isBadRequest());
        var forbiddenStock = variantInput("URB-003", "XL", "ROJO");
        forbiddenStock.put("currentStock", 100);
        send(HttpMethod.POST, "/api/products/" + fixture.productId() + "/variants", forbiddenStock)
                .andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM product_variants", Integer.class)).isEqualTo(1);
        assertThat(stock(fixture.variantId())).isZero();
    }

    @Test
    void permitsZeroCostAndDiscountedSellingPriceAccordingToDatabaseRules() throws Exception {
        var fixture = fixture();
        var input = variantInput("URB-002", "S", "ROJO");
        input.put("costPrice", BigDecimal.ZERO);
        send(HttpMethod.POST, "/api/products/" + fixture.productId() + "/variants", input)
                .andExpect(status().isCreated());
        input.put("sku", "URB-003");
        input.put("sizeLabel", "L");
        input.put("costPrice", new BigDecimal("30.00"));
        input.put("salePrice", new BigDecimal("20.00"));
        send(HttpMethod.POST, "/api/products/" + fixture.productId() + "/variants", input)
                .andExpect(status().isCreated());
    }

    @Test
    void protectsReadsWritesAndCostsWithTheExistingJwtAuthentication() throws Exception {
        var fixture = fixture();
        mvc.perform(get("/api/variants")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/variants").header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());
        login(ADMIN, "wrong-password").andExpect(status().is4xxClientError())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        login("inactiveadmin", PASSWORD).andExpect(status().is4xxClientError());
        sendAs(SELLER, HttpMethod.GET, "/api/variants/" + fixture.variantId(), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.costPrice").doesNotExist());
        sendAs(SELLER, HttpMethod.GET, "/api/variants", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].costPrice").doesNotExist());
        sendAs(SELLER, HttpMethod.POST, "/api/categories", Map.of("name", "Forbidden"))
                .andExpect(status().isForbidden());
        sendAs(SELLER, HttpMethod.POST, "/api/variants/" + fixture.variantId() + "/adjustments",
                Map.of("requestKey", UUID.randomUUID(), "quantity", 1, "reason", "Forbidden"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/categories").with(httpBasic(ADMIN, PASSWORD)).contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Basic is not the application login\"}"))
                .andExpect(status().isUnauthorized());
        // A valid Bearer token works without a second Basic login or CSRF exchange.
        send(HttpMethod.POST, "/api/categories", Map.of("name", "JWT category"))
                .andExpect(status().isCreated());
        assertThat(stock(fixture.variantId())).isZero();
    }

    @Test
    void rejectsPreviouslyIssuedTokenAfterUserIsDeactivated() throws Exception {
        String token = tokenFor(ADMIN);
        jdbc.update("UPDATE users SET is_active = false WHERE username = ?", ADMIN);
        mvc.perform(get("/api/variants").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void supportsExactBarcodeAndTreatsSearchWildcardsLiterally() throws Exception {
        var fixture = fixture();
        var input = variantInput("ACC_%001", "UNICA", "ROJO");
        input.put("barcode", "001234567890");
        long id = body(send(HttpMethod.POST, "/api/products/" + fixture.productId() + "/variants", input)
                .andExpect(status().isCreated())).get("id").asLong();
        sendAs(SELLER, HttpMethod.GET, "/api/variants/by-barcode?barcode=001234567890", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        mvc.perform(get("/api/variants").param("q", "%").header("Authorization", "Bearer " + tokenFor(ADMIN)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        send(HttpMethod.GET, "/api/variants?page=-1", null).andExpect(status().isBadRequest());
        send(HttpMethod.GET, "/api/variants?size=101", null).andExpect(status().isBadRequest());
    }

    @Test
    void waitsForCategoryChangeBeforeReactivatingItsProduct() throws Exception {
        var fixture = fixture();
        send(HttpMethod.DELETE, "/api/products/" + fixture.productId(), null).andExpect(status().isNoContent());
        tokenFor(ADMIN);
        try (var connection = jdbc.getDataSource().getConnection(); var workers = Executors.newSingleThreadExecutor()) {
            connection.setAutoCommit(false);
            try {
                try (var lock = connection.prepareStatement("SELECT id FROM categories WHERE id = ? FOR UPDATE")) {
                    lock.setLong(1, fixture.categoryId());
                    lock.executeQuery().close();
                }
                var activation = workers.submit(() -> send(HttpMethod.PATCH,
                        "/api/products/" + fixture.productId() + "/active", Map.of("isActive", true))
                        .andReturn().getResponse().getStatus());
                assertThatThrownBy(() -> activation.get(300, TimeUnit.MILLISECONDS)).isInstanceOf(TimeoutException.class);
                try (var update = connection.prepareStatement("UPDATE categories SET is_active = false WHERE id = ?")) {
                    update.setLong(1, fixture.categoryId());
                    update.executeUpdate();
                }
                connection.commit();
                assertThat(activation.get(10, TimeUnit.SECONDS)).isEqualTo(409);
            } finally {
                connection.rollback();
            }
        }
        assertThat(jdbc.queryForObject("SELECT is_active FROM products WHERE id = ?", Boolean.class,
                fixture.productId())).isFalse();
    }
}
