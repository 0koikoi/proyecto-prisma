package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.enums.FinancialTransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    List<FinancialTransaction> findAllByOrderByCreatedAtDesc();

    List<FinancialTransaction> findByStatusOrderByCreatedAtDesc(FinancialTransactionStatus status);

    @Query("SELECT ft FROM FinancialTransaction ft " +
           "WHERE ft.createdAt >= :startDate AND ft.createdAt <= :endDate " +
           "ORDER BY ft.createdAt DESC")
    List<FinancialTransaction> findBetweenDates(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("SELECT ft FROM FinancialTransaction ft " +
           "WHERE ft.createdAt >= :startDate AND ft.createdAt <= :endDate AND ft.status = :status " +
           "ORDER BY ft.createdAt DESC")
    List<FinancialTransaction> findBetweenDatesAndStatus(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("status") FinancialTransactionStatus status
    );

    Optional<FinancialTransaction> findByRequestKey(UUID requestKey);

    List<FinancialTransaction> findByPurchaseId(Long purchaseId);

    List<FinancialTransaction> findBySaleId(Long saleId);

    List<FinancialTransaction> findByOrderId(Long orderId);
}
