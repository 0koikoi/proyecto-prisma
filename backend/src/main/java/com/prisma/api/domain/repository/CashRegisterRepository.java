package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.CashRegister;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Repositorio de CashRegister.
 *
 * TODO Leo: Descomentar y completar los métodos. Sugeridos:
 *
 *   - Optional<CashRegister> findByStatus(String status)
 *     → Para obtener la caja activa (status = "OPEN"). Solo puede haber una.
 *     → Usar en SaleUseCase para asociar cada venta a la caja actual.
 */
public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {
    // TODO Leo: Optional<CashRegister> findByStatus(String status);
}
