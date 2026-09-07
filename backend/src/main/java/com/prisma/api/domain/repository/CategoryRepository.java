package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Repositorio de Category. Extiende JpaRepository para operaciones CRUD estándar.
 *
 * TODO Mauricio: Agregar queries personalizadas si se necesitan, por ejemplo:
 *   - Optional<Category> findByName(String name);
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // TODO Mauricio: agregar métodos de búsqueda personalizados si se requieren
}
