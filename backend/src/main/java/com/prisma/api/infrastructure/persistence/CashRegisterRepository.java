package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.enums.CashRegisterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {
    Optional<CashRegister> findFirstByStatus(CashRegisterStatus status);
}
