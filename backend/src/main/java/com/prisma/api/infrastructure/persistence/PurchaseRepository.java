package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findAllByOrderByPurchasedAtDesc();
    List<Purchase> findBySupplierIdOrderByPurchasedAtDesc(Long supplierId);
    Optional<Purchase> findByRequestKey(UUID requestKey);
}
