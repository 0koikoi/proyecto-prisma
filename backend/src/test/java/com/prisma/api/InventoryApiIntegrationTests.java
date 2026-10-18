package com.prisma.api;

import com.prisma.api.support.LocalPostgresTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InventoryApiIntegrationTests extends LocalPostgresTest {

    @Test
    void appliesSignedAdjustmentsAndRecordsAuthenticatedActor() throws Exception {
        var fixture = fixture();
        UUID firstKey = UUID.randomUUID();
        long firstId = body(adjust(fixture.variantId(), firstKey, 10, "Opening physical count")
                .andExpect(status().isCreated())).get("id").asLong();
        adjust(fixture.variantId(), UUID.randomUUID(), -3, "Damaged units").andExpect(status().isCreated());

        assertThat(stock(fixture.variantId())).isEqualTo(7);
        assertThat(movements(fixture.variantId())).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT sum(quantity) FROM inventory_movements WHERE variant_id = ?",
                Integer.class, fixture.variantId())).isEqualTo(7);
        assertThat(jdbc.queryForObject("""
                SELECT u.username FROM inventory_movements m JOIN users u ON u.id = m.created_by WHERE m.id = ?
                """, String.class, firstId)).isEqualTo(ADMIN);
        assertThat(jdbc.queryForObject("SELECT movement_type FROM inventory_movements WHERE id = ?",
                String.class, firstId)).isEqualTo("ADJUSTMENT");
        send(HttpMethod.GET, "/api/inventory/movements?variantId=" + fixture.variantId(), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void repeatedRequestIsIdempotentAndDifferentPayloadIsAConflict() throws Exception {
        var fixture = fixture();
        UUID requestKey = UUID.randomUUID();
        var original = body(adjust(fixture.variantId(), requestKey, 4, "Verified count")
                .andExpect(status().is2xxSuccessful()));
        var repeated = body(adjust(fixture.variantId(), requestKey, 4, "Verified count")
                .andExpect(status().is2xxSuccessful()));
        assertThat(repeated.get("id").asLong()).isEqualTo(original.get("id").asLong());
        assertThat(stock(fixture.variantId())).isEqualTo(4);
        assertThat(movements(fixture.variantId())).isEqualTo(1);

        adjust(fixture.variantId(), requestKey, 5, "Verified count").andExpect(status().isConflict());
        adjust(fixture.variantId(), requestKey, 4, "Different justification").andExpect(status().isConflict());
        long other = createVariant(fixture.productId(), "URB-002", "L", "NEGRO");
        adjust(other, requestKey, 4, "Verified count").andExpect(status().isConflict());
        assertThat(stock(other)).isZero();
        assertThat(movements(other)).isZero();
        assertThat(stock(fixture.variantId())).isEqualTo(4);
    }

    @Test
    void rejectsZeroMissingReasonInsufficientStockAndSpoofedActorWithoutPartialWrites() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 0, "Zero change").andExpect(status().isBadRequest());
        adjust(fixture.variantId(), UUID.randomUUID(), 1, "  ").andExpect(status().isBadRequest());
        adjust(fixture.variantId(), UUID.randomUUID(), -1, "No stock").andExpect(status().isConflict());
        adjust(999999, UUID.randomUUID(), 1, "Missing variant").andExpect(status().isNotFound());
        send(HttpMethod.POST, "/api/variants/" + fixture.variantId() + "/adjustments",
                Map.of("requestKey", UUID.randomUUID(), "quantity", 1, "reason", "Invalid actor", "createdBy", 999999))
                .andExpect(status().isBadRequest());
        assertThat(stock(fixture.variantId())).isZero();
        assertThat(movements(fixture.variantId())).isZero();
    }

    @Test
    void mapsPhysicalReservedAndAvailableStockAndProtectsActiveReservations() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 5, "Opening physical count").andExpect(status().isCreated());
        long reservation = reserve(fixture.variantId(), 4);
        var response = variant(fixture.variantId());
        assertThat(response.get("currentStock").asInt()).isEqualTo(5);
        assertThat(response.get("reservedStock").asInt()).isEqualTo(4);
        assertThat(response.get("availableStock").asInt()).isEqualTo(1);
        send(HttpMethod.GET, "/api/variants?lowStock=true", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        adjust(fixture.variantId(), UUID.randomUUID(), -2, "Would consume reservation").andExpect(status().isConflict());
        assertThat(stock(fixture.variantId())).isEqualTo(5);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
        send(HttpMethod.DELETE, "/api/variants/" + fixture.variantId(), null).andExpect(status().isConflict());
        send(HttpMethod.DELETE, "/api/products/" + fixture.productId(), null).andExpect(status().isConflict());
        adjust(fixture.variantId(), UUID.randomUUID(), -1, "Only unreserved unit").andExpect(status().isCreated());
        assertThat(stock(fixture.variantId())).isEqualTo(4);
        assertThat(variant(fixture.variantId()).get("availableStock").asInt()).isZero();

        jdbc.update("UPDATE inventory_reservations SET status = 'RELEASED', ended_at = CURRENT_TIMESTAMP WHERE order_detail_id = ?",
                reservation);
        assertThat(variant(fixture.variantId()).get("reservedStock").asInt()).isZero();
        assertThat(variant(fixture.variantId()).get("availableStock").asInt()).isEqualTo(4);
    }

    @Test
    void concurrentWithdrawalsOfLastUnitCommitExactlyOnce() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 1, "Last unit").andExpect(status().isCreated());
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var workers = Executors.newFixedThreadPool(2)) {
            Callable<Integer> withdraw = () -> {
                ready.countDown();
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                return adjust(fixture.variantId(), UUID.randomUUID(), -1, "Concurrent withdrawal")
                        .andReturn().getResponse().getStatus();
            };
            var first = workers.submit(withdraw);
            var second = workers.submit(withdraw);
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            List<Integer> statuses = List.of(first.get(20, TimeUnit.SECONDS), second.get(20, TimeUnit.SECONDS));
            assertThat(statuses).containsExactlyInAnyOrder(201, 409);
        } finally {
            start.countDown();
        }
        assertThat(stock(fixture.variantId())).isZero();
        assertThat(movements(fixture.variantId())).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT sum(quantity) FROM inventory_movements WHERE variant_id = ?",
                Integer.class, fixture.variantId())).isZero();
    }

    @Test
    void concurrentRetriesWithSameKeyNeverDoubleApplyTheAdjustment() throws Exception {
        var fixture = fixture();
        UUID key = UUID.randomUUID();
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var workers = Executors.newFixedThreadPool(2)) {
            Callable<Integer> retry = () -> {
                ready.countDown();
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                return adjust(fixture.variantId(), key, 2, "One logical operation")
                        .andReturn().getResponse().getStatus();
            };
            var first = workers.submit(retry);
            var second = workers.submit(retry);
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(first.get(20, TimeUnit.SECONDS)).isEqualTo(201);
            assertThat(second.get(20, TimeUnit.SECONDS)).isEqualTo(201);
        } finally {
            start.countDown();
        }
        assertThat(stock(fixture.variantId())).isEqualTo(2);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
    }

    @Test
    void failedLedgerInsertRollsBackTheStockUpdate() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), 3, "Opening balance").andExpect(status().isCreated());
        jdbc.execute("""
                CREATE FUNCTION prisma_test_reject_movement() RETURNS trigger LANGUAGE plpgsql AS $$
                BEGIN
                    IF NEW.reason = '__rollback_probe__' THEN
                        RAISE EXCEPTION 'Test-only ledger failure' USING ERRCODE = '23514';
                    END IF;
                    RETURN NEW;
                END;
                $$
                """);
        jdbc.execute("""
                CREATE TRIGGER prisma_test_reject_movement BEFORE INSERT ON inventory_movements
                FOR EACH ROW EXECUTE FUNCTION prisma_test_reject_movement()
                """);
        try {
            adjust(fixture.variantId(), UUID.randomUUID(), 2, "__rollback_probe__")
                    .andExpect(status().isConflict());
            assertThat(stock(fixture.variantId())).isEqualTo(3);
            assertThat(movements(fixture.variantId())).isEqualTo(1);
        } finally {
            jdbc.execute("DROP TRIGGER IF EXISTS prisma_test_reject_movement ON inventory_movements");
            jdbc.execute("DROP FUNCTION IF EXISTS prisma_test_reject_movement()");
        }
    }

    @Test
    void reversesAnAdjustmentOnceWithoutDeletingHistory() throws Exception {
        var fixture = fixture();
        long originalId = body(adjust(fixture.variantId(), UUID.randomUUID(), 6, "Incorrect opening count")
                .andExpect(status().isCreated())).get("id").asLong();
        var request = Map.of("requestKey", UUID.randomUUID(), "reason", "Count was entered twice");
        long reversalId = body(send(HttpMethod.POST, "/api/inventory/movements/" + originalId + "/reversal", request)
                .andExpect(status().isCreated()).andExpect(jsonPath("$.quantity").value(-6))
                .andExpect(jsonPath("$.reversalOfId").value(originalId))).get("id").asLong();
        send(HttpMethod.POST, "/api/inventory/movements/" + originalId + "/reversal", request)
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(reversalId));
        send(HttpMethod.POST, "/api/inventory/movements/" + originalId + "/reversal",
                Map.of("requestKey", UUID.randomUUID(), "reason", "Another reversal"))
                .andExpect(status().isConflict());
        send(HttpMethod.POST, "/api/inventory/movements/" + reversalId + "/reversal",
                Map.of("requestKey", UUID.randomUUID(), "reason", "Reverse the reversal"))
                .andExpect(status().isConflict());
        sendAs(SELLER, HttpMethod.POST, "/api/inventory/movements/" + originalId + "/reversal", request)
                .andExpect(status().isForbidden());
        assertThat(stock(fixture.variantId())).isZero();
        assertThat(movements(fixture.variantId())).isEqualTo(2);
        send(HttpMethod.GET, "/api/inventory/movements/" + originalId, null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.quantity").value(6));
    }

    @Test
    void reversingAnAdjustmentCannotConsumeReservedUnits() throws Exception {
        var fixture = fixture();
        long originalId = body(adjust(fixture.variantId(), UUID.randomUUID(), 5, "Opening count")
                .andExpect(status().isCreated())).get("id").asLong();
        reserve(fixture.variantId(), 2);
        send(HttpMethod.POST, "/api/inventory/movements/" + originalId + "/reversal",
                Map.of("requestKey", UUID.randomUUID(), "reason", "Attempt to remove reserved stock"))
                .andExpect(status().isConflict());
        assertThat(stock(fixture.variantId())).isEqualTo(5);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
    }

    @Test
    void filtersMovementDatesWithInclusiveStartAndExclusiveEnd() throws Exception {
        var fixture = fixture();
        long firstId = body(adjust(fixture.variantId(), UUID.randomUUID(), 3, "First day")
                .andExpect(status().isCreated())).get("id").asLong();
        long secondId = body(adjust(fixture.variantId(), UUID.randomUUID(), -1, "Second day")
                .andExpect(status().isCreated())).get("id").asLong();
        jdbc.update("UPDATE inventory_movements SET created_at = TIMESTAMPTZ '2026-01-01 00:00:00Z' WHERE id = ?", firstId);
        jdbc.update("UPDATE inventory_movements SET created_at = TIMESTAMPTZ '2026-01-02 00:00:00Z' WHERE id = ?", secondId);
        send(HttpMethod.GET, "/api/inventory/movements?type=ADJUSTMENT&from=2026-01-01T00:00:00Z&to=2026-01-02T00:00:00Z", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.items[0].id").value(firstId));
        send(HttpMethod.GET, "/api/inventory/movements?from=2026-01-02T00:00:00Z&to=2026-01-01T00:00:00Z", null)
                .andExpect(status().isBadRequest());
        send(HttpMethod.GET, "/api/inventory/movements?from=not-a-date", null).andExpect(status().isBadRequest());
        send(HttpMethod.GET, "/api/inventory/movements/999999", null).andExpect(status().isNotFound());
    }

    @Test
    void rejectsStockOverflowAndInactiveVariantsWithoutLedgerWrites() throws Exception {
        var fixture = fixture();
        adjust(fixture.variantId(), UUID.randomUUID(), Integer.MAX_VALUE, "Upper stock bound")
                .andExpect(status().isCreated());
        adjust(fixture.variantId(), UUID.randomUUID(), 1, "Overflow").andExpect(status().isBadRequest());
        assertThat(stock(fixture.variantId())).isEqualTo(Integer.MAX_VALUE);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
        send(HttpMethod.DELETE, "/api/variants/" + fixture.variantId(), null).andExpect(status().isNoContent());
        adjust(fixture.variantId(), UUID.randomUUID(), -1, "Inactive variant").andExpect(status().isConflict());
        assertThat(stock(fixture.variantId())).isEqualTo(Integer.MAX_VALUE);
        assertThat(movements(fixture.variantId())).isEqualTo(1);
    }

    @Test
    void sameRequestKeyAcrossVariantsRollsBackTheLosingOperation() throws Exception {
        var fixture = fixture();
        long otherCategory = createCategory("Mascotas");
        long otherProduct = createProduct(otherCategory, "Chaleco");
        long otherVariant = createVariant(otherProduct, "PET-001", "M", "ROJO");
        UUID key = UUID.randomUUID();
        CountDownLatch start = new CountDownLatch(1);
        tokenFor(ADMIN);
        try (var workers = Executors.newFixedThreadPool(2)) {
            var first = workers.submit(() -> {
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                return adjust(fixture.variantId(), key, 2, "Same key different variant").andReturn().getResponse().getStatus();
            });
            var second = workers.submit(() -> {
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                return adjust(otherVariant, key, 2, "Same key different variant").andReturn().getResponse().getStatus();
            });
            start.countDown();
            assertThat(List.of(first.get(20, TimeUnit.SECONDS), second.get(20, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(201, 409);
        } finally {
            start.countDown();
        }
        assertThat(stock(fixture.variantId()) + stock(otherVariant)).isEqualTo(2);
        assertThat(movements(fixture.variantId()) + movements(otherVariant)).isEqualTo(1);
    }
}
