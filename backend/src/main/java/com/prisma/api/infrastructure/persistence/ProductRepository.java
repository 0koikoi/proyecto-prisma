package com.prisma.api.infrastructure.persistence;

import com.prisma.api.domain.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio Spring Data JPA para la entidad Producto.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Busca un producto activo por ID
    Optional<Product> findByIdAndIsActiveTrue(Long id);
}
