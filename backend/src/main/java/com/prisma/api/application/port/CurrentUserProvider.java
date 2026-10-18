package com.prisma.api.application.port;

import com.prisma.api.domain.entities.User;

/**
 * Puerto de abstracción para obtener el usuario autenticado actual.
 * Desacopla la lógica de negocio de Spring Security y permite stubs en tests o desarrollo inicial.
 */
public interface CurrentUserProvider {
    User getCurrentUser();
    Long getCurrentUserId();
}
