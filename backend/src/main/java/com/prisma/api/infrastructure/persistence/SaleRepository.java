package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByRequestKey(UUID requestKey);

    List<Sale> findByCashRegisterIdOrderByIdDesc(Long cashRegisterId);
}
