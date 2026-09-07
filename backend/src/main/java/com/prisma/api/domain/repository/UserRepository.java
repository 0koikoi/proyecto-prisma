package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * RESPONSABLE: Keila
 * MÓDULO: Autenticación — Repositorio de Usuarios
 *
 * Consultas JPA para validación de credenciales en el login y gestión de usuarios.
 *
 * TODO Keila:
 *  - Usar findByUsername para cargar el usuario durante la autenticación con Spring Security.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
}
