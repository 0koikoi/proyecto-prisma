package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    Optional<InventoryMovement> findByRequestKey(UUID requestKey);
    List<InventoryMovement> findByVariantIdOrderByCreatedAtDesc(Long variantId);
}
