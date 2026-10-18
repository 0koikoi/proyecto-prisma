package com.prisma.api.infrastructure.config;

import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.infrastructure.persistence.UserRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Proveedor por defecto de usuario para desarrollo y desacople temprano.
 * Utiliza el usuario 'admin' precargado en Neon (V2__datos_iniciales.sql) o un fallback en memoria.
 */
@Configuration
public class SecurityStubConfig {

    @Bean
    @ConditionalOnMissingBean(CurrentUserProvider.class)
    public CurrentUserProvider currentUserProvider(UserRepository userRepository) {
        return new CurrentUserProvider() {
            @Override
            public User getCurrentUser() {
                return userRepository.findByUsername("admin")
                        .orElseGet(() -> {
                            User fallback = new User("admin", "no-hash", "Administrador Tienda", UserRole.ADMIN);
                            fallback.setId(1L);
                            return fallback;
                        });
            }

            @Override
            public Long getCurrentUserId() {
                return getCurrentUser().getId();
            }
        };
    }
}
