package com.prisma.api.application.services;

import com.prisma.api.application.dto.catalog.CatalogDtos.*;
import com.prisma.api.application.security.CatalogActor;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.InventoryMovementType;
import com.prisma.api.domain.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

import static com.prisma.api.application.services.CatalogService.*;

@Service
@Transactional(readOnly = true)
public class InventoryService {
    private final ProductVariantRepository variants;
    private final InventoryMovementRepository movements;
    private final CatalogActor actor;
    private final CatalogLocks locks;

    public InventoryService(ProductVariantRepository variants, InventoryMovementRepository movements,
                            CatalogActor actor, CatalogLocks locks) {
        this.variants = variants;
        this.movements = movements;
        this.actor = actor;
        this.locks = locks;
    }

    @Transactional
    public MovementResponse adjustStock(Long variantId, AdjustmentRequest request) {
        User user = actor.requireAdmin();
        if (request.requestKey() == null || request.quantity() == null || request.quantity() == 0) {
            throw badRequest("La clave de petición es obligatoria y la cantidad debe ser distinta de cero.");
        }
        String reason = requiredText(request.reason(), 1000, "motivo");
        Optional<InventoryMovement> previous = movements.findByRequestKey(request.requestKey());
        if (previous.isPresent()) return replay(previous.get(), variantId, request.quantity(), reason, user);

        ProductVariant variant = locks.lockVariant(variantId);
        // Another request with this key may have committed while this one waited.
        previous = movements.findByRequestKey(request.requestKey());
        if (previous.isPresent()) return replay(previous.get(), variantId, request.quantity(), reason, user);
        applyStockDelta(variant, request.quantity());
        InventoryMovement movement = new InventoryMovement(variant, user, InventoryMovementType.ADJUSTMENT, request.quantity(), reason);
        movement.setRequestKey(request.requestKey());
        variants.saveAndFlush(variant);
        // If this insert fails, the transaction also rolls back the new stock.
        movements.saveAndFlush(movement);
        return movementResponse(movement);
    }

    /** Corrects only manual inventory adjustments; sales/purchases own their return workflows. */
    @Transactional
    public MovementResponse reverseAdjustment(Long movementId, ReversalRequest request) {
        User user = actor.requireAdmin();
        if (request.requestKey() == null) throw badRequest("La clave de petición es obligatoria.");
        String reason = requiredText(request.reason(), 1000, "motivo");
        Optional<InventoryMovement> previous = movements.findByRequestKey(request.requestKey());
        if (previous.isPresent()) return replayReversal(previous.get(), movementId, reason, user);

        InventoryMovement original = movements.findById(movementId).orElseThrow(() -> missing("Movimiento"));
        if (original.getMovementType() != InventoryMovementType.ADJUSTMENT) {
            throw conflict("Solo se pueden revertir ajustes manuales desde inventario.");
        }
        ProductVariant variant = locks.lockVariant(original.getVariant().getId());
        previous = movements.findByRequestKey(request.requestKey());
        if (previous.isPresent()) return replayReversal(previous.get(), movementId, reason, user);
        if (movements.existsByReversalOfId(movementId)) throw conflict("El ajuste ya fue revertido.");

        long quantity = -(long) original.getQuantity();
        if (quantity > Integer.MAX_VALUE) throw badRequest("La cantidad a revertir supera el máximo permitido.");
        applyStockDelta(variant, (int) quantity);
        InventoryMovement reversal = new InventoryMovement(variant, user, InventoryMovementType.REVERSAL,
                (int) quantity, reason);
        reversal.setRequestKey(request.requestKey());
        reversal.setReversalOf(original);
        variants.saveAndFlush(variant);
        movements.saveAndFlush(reversal);
        return movementResponse(reversal);
    }

    public MovementResponse getMovement(Long id) {
        actor.requireReader();
        return movementResponse(movements.findById(id).orElseThrow(() -> missing("Movimiento")));
    }

    public PageResponse<MovementResponse> listMovements(Long variantId, InventoryMovementType type,
                                                        Instant from, Instant to, int page, int size) {
        actor.requireReader();
        if (from != null && to != null && !from.isBefore(to)) {
            throw badRequest("El inicio del período debe ser anterior al final.");
        }
        if (variantId != null && !variants.existsById(variantId)) throw missing("Variante");
        Specification<InventoryMovement> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (variantId != null) predicates.add(cb.equal(root.get("variant").get("id"), variantId));
            if (type != null) predicates.add(cb.equal(root.get("movementType"), type));
            if (from != null) predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            if (to != null) predicates.add(cb.lessThan(root.get("createdAt"), to));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Pageable requested = paging(page, size);
        Pageable newestFirst = PageRequest.of(requested.getPageNumber(), requested.getPageSize(),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return response(movements.findAll(spec, newestFirst), this::movementResponse);
    }

    private void applyStockDelta(ProductVariant variant, int quantity) {
        if (!variant.isActive() || !variant.getProduct().isActive() || !variant.getProduct().getCategory().isActive()) {
            throw conflict("No se puede ajustar una variante, producto o categoría inactiva.");
        }
        long reserved = variants.findAvailability(List.of(variant.getId())).stream()
                .findFirst().map(ProductVariantRepository.Availability::getReservedStock).orElse(0L);
        long next = (long) variant.getCurrentStock() + quantity;
        if (next < 0 || next < reserved) throw conflict("El ajuste supera el stock disponible o afecta unidades reservadas.");
        if (next > Integer.MAX_VALUE) throw badRequest("El ajuste supera la cantidad máxima permitida.");
        variant.setCurrentStock((int) next);
    }

    private MovementResponse replayReversal(InventoryMovement previous, Long movementId, String reason, User user) {
        if (previous.getMovementType() != InventoryMovementType.REVERSAL
                || previous.getReversalOf() == null || !Objects.equals(previous.getReversalOf().getId(), movementId)
                || !Objects.equals(previous.getReason(), reason)
                || !Objects.equals(previous.getCreatedBy().getId(), user.getId())) {
            throw conflict("La clave de petición ya fue utilizada para otra operación.");
        }
        return movementResponse(previous);
    }

    private MovementResponse replay(InventoryMovement previous, Long variantId, Integer quantity, String reason, User user) {
        if (!Objects.equals(previous.getVariant().getId(), variantId)
                || previous.getMovementType() != InventoryMovementType.ADJUSTMENT
                || !Objects.equals(previous.getQuantity(), quantity)
                || !Objects.equals(previous.getReason(), reason)
                || !Objects.equals(previous.getCreatedBy().getId(), user.getId())) {
            throw conflict("La clave de petición ya fue utilizada para otra operación.");
        }
        return movementResponse(previous);
    }

    private MovementResponse movementResponse(InventoryMovement movement) {
        return new MovementResponse(movement.getId(), movement.getVariant().getId(), movement.getVariant().getSku(),
                movement.getMovementType(), movement.getQuantity(), movement.getReason(), movement.getRequestKey(),
                movement.getCreatedBy().getId(), movement.getCreatedBy().getFullName(), movement.getCreatedAt(),
                movement.getSaleDetail() == null ? null : movement.getSaleDetail().getId(),
                movement.getOrderDetail() == null ? null : movement.getOrderDetail().getId(),
                movement.getPurchaseDetail() == null ? null : movement.getPurchaseDetail().getId(),
                movement.getSaleReturnDetail() == null ? null : movement.getSaleReturnDetail().getId(),
                movement.getReversalOf() == null ? null : movement.getReversalOf().getId());
    }
}
