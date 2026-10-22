package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsByCategoryIdAndIsActiveTrue(Long categoryId);
    Optional<Product> findByIdAndIsActiveTrue(Long id);

    // A scalar lookup does not populate the persistence context before locking.
    @Query("select p.category.id from Product p where p.id = :id")
    Optional<Long> findCategoryIdById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findLockedById(@Param("id") Long id);
}
