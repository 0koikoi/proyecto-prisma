package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.enums.CashRegisterStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {

    Optional<CashRegister> findFirstByStatus(CashRegisterStatus status);

    /**
     * Bloqueo compartido: varias ventas pueden confirmarse a la vez, pero un cierre
     * (bloqueo exclusivo) espera a que terminen y ninguna venta entra a un turno ya cerrado.
     */
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("select c from CashRegister c where c.status = :status")
    Optional<CashRegister> findByStatusForShare(@Param("status") CashRegisterStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CashRegister c where c.status = :status")
    Optional<CashRegister> findByStatusForUpdate(@Param("status") CashRegisterStatus status);
}
