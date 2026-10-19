package com.prisma.api.infrastructure.config;

import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.repository.UserRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Proveedor de usuario autenticado conectado al SecurityContext de Spring Security.
 * Si la petición tiene token JWT válido, extrae la entidad User de la sesión.
 * Si no hay sesión (ej. desarrollo/scripts), recurre al usuario 'admin' de Neon.
 */
@Component
@Primary
public class SpringSecurityCurrentUserProvider implements CurrentUserProvider {

    private final UserRepository userRepository;

    public SpringSecurityCurrentUserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }

        // Fallback a 'admin' para no romper ejecuciones locales/background
        return userRepository.findByUsername("admin")
                .orElseGet(() -> {
                    User fallback = new User("admin", "no-hash", "Administrador General", UserRole.ADMIN);
                    fallback.setId(1L);
                    return fallback;
                });
    }

    @Override
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
