package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.PurchaseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseDetailRepository extends JpaRepository<PurchaseDetail, Long> {
    List<PurchaseDetail> findByPurchaseId(Long purchaseId);
}
