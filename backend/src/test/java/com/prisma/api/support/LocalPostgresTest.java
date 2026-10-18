package com.prisma.api.support;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** All application and Flyway connections are pinned to one disposable local PostgreSQL. */
@SpringBootTest(properties = {
        "spring.config.location=classpath:application-isolated-test.properties",
        "spring.config.additional-location=",
        "spring.config.import=",
        "spring.profiles.active=isolated-test"
})
@AutoConfigureMockMvc
@ActiveProfiles("isolated-test")
public abstract class LocalPostgresTest {
    protected static final String ADMIN = "readeradmin";
    protected static final String SELLER = "readerstaff";
    protected static final String PASSWORD = "prisma-local-test-password";
    protected static final JsonMapper JSON = JsonMapper.builder().build();
    private static final EmbeddedPostgres POSTGRES = startPostgres();
    private final Map<String, String> accessTokens = new ConcurrentHashMap<>();

    @Autowired protected MockMvc mvc;
    @Autowired protected JdbcTemplate jdbc;

    @DynamicPropertySource
    static void localDatabaseProperties(DynamicPropertyRegistry properties) {
        String url = POSTGRES.getJdbcUrl("postgres", "postgres");
        if (!url.matches("jdbc:postgresql://(localhost|127\\.0\\.0\\.1):[0-9]+/postgres(?:\\?.*)?")) {
            throw new IllegalStateException("Integration tests require an embedded loopback database");
        }
        properties.add("spring.datasource.url", () -> url);
        properties.add("spring.datasource.username", () -> "postgres");
        properties.add("spring.datasource.password", () -> "");
        properties.add("spring.datasource.hikari.jdbc-url", () -> url);
        properties.add("spring.datasource.hikari.username", () -> "postgres");
        properties.add("spring.datasource.hikari.password", () -> "");
        properties.add("spring.flyway.url", () -> url);
        properties.add("spring.flyway.user", () -> "postgres");
        properties.add("spring.flyway.password", () -> "");
        properties.add("jwt.secret", () -> "prisma_disposable_test_secret_never_use_outside_tests_7600c49f");
        properties.add("jwt.expiration-ms", () -> "3600000");
    }

    private static EmbeddedPostgres startPostgres() {
        try {
            EmbeddedPostgres database = EmbeddedPostgres.builder()
                    .setPort(0)
                    .setServerConfig("listen_addresses", "127.0.0.1")
                    .setCleanDataDirectory(true)
                    .start();
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try { database.close(); } catch (IOException ignored) { }
            }, "prisma-test-postgres-shutdown"));
            return database;
        } catch (IOException exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    @BeforeEach
    void resetOnlyTheDisposableDatabase() throws Exception {
        try (Connection connection = jdbc.getDataSource().getConnection()) {
            assertThat(connection.getMetaData().getURL()).isEqualTo(POSTGRES.getJdbcUrl("postgres", "postgres"));
        }
        accessTokens.clear();
        // These root tables cascade only inside the verified ephemeral database.
        jdbc.execute("TRUNCATE TABLE categories, users RESTART IDENTITY CASCADE");
        String hash = new BCryptPasswordEncoder(4).encode(PASSWORD);
        jdbc.update("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
                ADMIN, hash, "Local test administrator", "ADMIN");
        jdbc.update("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
                SELLER, hash, "Local test seller", "VENDEDOR");
        jdbc.update("INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, false)",
                "inactiveadmin", hash, "Inactive local test administrator", "ADMIN");
    }

    protected ResultActions send(HttpMethod method, String path, Object body) throws Exception {
        return sendAs(ADMIN, method, path, body);
    }

    protected ResultActions sendAs(String username, HttpMethod method, String path, Object body) throws Exception {
        var request = request(method, path).header(AUTHORIZATION, "Bearer " + tokenFor(username))
                .contentType(APPLICATION_JSON);
        if (body != null) request.content(JSON.writeValueAsString(body));
        return mvc.perform(request);
    }

    protected ResultActions login(String username, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                .content(JSON.writeValueAsString(Map.of("username", username, "password", password))));
    }

    /** Uses the actual authentication endpoint so integration tests exercise JWT verification. */
    protected String tokenFor(String username) throws Exception {
        String cached = accessTokens.get(username);
        if (cached != null) return cached;
        String token = body(login(username, PASSWORD).andExpect(status().isOk())).get("token").asText();
        assertThat(token).isNotBlank();
        accessTokens.putIfAbsent(username, token);
        return accessTokens.get(username);
    }

    protected JsonNode body(ResultActions result) throws Exception {
        return JSON.readTree(result.andReturn().getResponse().getContentAsString());
    }

    protected long createCategory(String name) throws Exception {
        return body(send(HttpMethod.POST, "/api/categories", Map.of("name", name, "description", "Local test"))
                .andExpect(status().isCreated())).get("id").asLong();
    }

    protected long createProduct(long categoryId, String name) throws Exception {
        return body(send(HttpMethod.POST, "/api/products", Map.of("categoryId", categoryId, "name", name,
                "description", "Local test product", "imageUrl", "https://example.test/product.png"))
                .andExpect(status().isCreated())).get("id").asLong();
    }

    protected Map<String, Object> variantInput(String sku, String size, String color) {
        Map<String, Object> input = new LinkedHashMap<>();
        input.put("sku", sku);
        input.put("barcode", null);
        input.put("sizeLabel", size);
        input.put("colorLabel", color);
        input.put("costPrice", new BigDecimal("12.1234"));
        input.put("salePrice", new BigDecimal("25.50"));
        input.put("minStockAlert", 3);
        return input;
    }

    protected long createVariant(long productId, String sku, String size, String color) throws Exception {
        return body(send(HttpMethod.POST, "/api/products/" + productId + "/variants", variantInput(sku, size, color))
                .andExpect(status().isCreated())).get("id").asLong();
    }

    protected CatalogFixture fixture() throws Exception {
        long categoryId = createCategory("Urbana");
        long productId = createProduct(categoryId, "Polera");
        long variantId = createVariant(productId, "URB-001", "M", "NEGRO");
        return new CatalogFixture(categoryId, productId, variantId);
    }

    protected JsonNode variant(long id) throws Exception {
        return body(send(HttpMethod.GET, "/api/variants/" + id, null).andExpect(status().isOk()));
    }

    protected ResultActions adjust(long variantId, UUID requestKey, int quantity, String reason) throws Exception {
        return send(HttpMethod.POST, "/api/variants/" + variantId + "/adjustments",
                Map.of("requestKey", requestKey, "quantity", quantity, "reason", reason));
    }

    protected int stock(long variantId) {
        return jdbc.queryForObject("SELECT current_stock FROM product_variants WHERE id = ?", Integer.class, variantId);
    }

    protected int movements(long variantId) {
        return jdbc.queryForObject("SELECT count(*) FROM inventory_movements WHERE variant_id = ?", Integer.class, variantId);
    }

    protected long reserve(long variantId, int quantity) {
        long actorId = jdbc.queryForObject("SELECT id FROM users WHERE username = ?", Long.class, ADMIN);
        long orderId = jdbc.queryForObject("""
                INSERT INTO orders (order_code, request_key, created_by, channel, customer_name,
                    customer_phone, shipping_address, reference, delivery_scope, requested_payment_method)
                VALUES (?, ?, ?, 'WHATSAPP', 'Test customer', '900000000', 'Test address',
                    'Test reference', 'LOCAL', 'EFECTIVO') RETURNING id
                """, Long.class, "TEST-" + UUID.randomUUID(), UUID.randomUUID(), actorId);
        long detailId = jdbc.queryForObject("""
                INSERT INTO order_details (order_id, variant_id, quantity, unit_price)
                VALUES (?, ?, ?, 25.50) RETURNING id
                """, Long.class, orderId, variantId, quantity);
        jdbc.update("INSERT INTO inventory_reservations (order_detail_id, created_by) VALUES (?, ?)", detailId, actorId);
        return detailId;
    }

    protected record CatalogFixture(long categoryId, long productId, long variantId) { }
}
