package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.SaleDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SaleDetailRepository extends JpaRepository<SaleDetail, Long> {

    List<SaleDetail> findBySaleIdOrderByIdAsc(Long saleId);

    /** Líneas de varias ventas en una sola consulta, con variante y producto para armar el ticket. */
    @Query("select d from SaleDetail d join fetch d.variant v join fetch v.product "
            + "where d.sale.id in :saleIds order by d.id")
    List<SaleDetail> findAllBySaleIds(@Param("saleIds") Collection<Long> saleIds);
}
