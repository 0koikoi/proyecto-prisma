package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.enums.FinancialTransactionStatus;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.enums.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    List<FinancialTransaction> findBySaleId(Long saleId);

    List<FinancialTransaction> findBySaleIdIn(Collection<Long> saleIds);

    /** Total por método de pago y dirección (IN/OUT) de un turno de caja. */
    interface MethodTotal {
        PaymentMethod getPaymentMethod();

        FinancialTransactionType getTransactionType();

        BigDecimal getTotal();
    }

    @Query("select ft.paymentMethod as paymentMethod, ft.transactionType as transactionType, sum(ft.amount) as total "
            + "from FinancialTransaction ft "
            + "where ft.cashRegister.id = :registerId and ft.status = :status "
            + "group by ft.paymentMethod, ft.transactionType")
    List<MethodTotal> totalsByRegister(@Param("registerId") Long registerId,
                                       @Param("status") FinancialTransactionStatus status);
}
