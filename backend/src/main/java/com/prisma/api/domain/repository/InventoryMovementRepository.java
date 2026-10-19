package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.InventoryMovement;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;
import java.util.UUID;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long>, JpaSpecificationExecutor<InventoryMovement> {
    Optional<InventoryMovement> findByRequestKey(UUID requestKey);
    boolean existsByReversalOfId(Long movementId);
    java.util.List<InventoryMovement> findByVariantIdOrderByCreatedAtDesc(Long variantId);
}
