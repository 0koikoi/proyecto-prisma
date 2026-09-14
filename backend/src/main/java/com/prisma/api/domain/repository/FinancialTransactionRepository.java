package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    List<FinancialTransaction> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from, LocalDateTime to);

    List<FinancialTransaction> findByTransactionTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            String transactionType, LocalDateTime from, LocalDateTime to);

    List<FinancialTransaction> findByCategoryAndCreatedAtBetweenOrderByCreatedAtDesc(
            String category, LocalDateTime from, LocalDateTime to);

    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FinancialTransaction ft " +
           "WHERE ft.transactionType = :type AND ft.createdAt BETWEEN :from AND :to")
    BigDecimal sumAmountByTypeAndDateRange(
            @Param("type") String transactionType,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FinancialTransaction ft " +
           "WHERE ft.category = :category AND ft.createdAt BETWEEN :from AND :to")
    BigDecimal sumAmountByCategoryAndDateRange(
            @Param("category") String category,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
