package com.prisma.api.application.security;

import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.infrastructure.persistence.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Resolves the current actor independently of the HTTP authentication mechanism. */
@Component
public class CatalogActor {
    private final UserRepository users;

    public CatalogActor(UserRepository users) {
        this.users = users;
    }

    public User requireReader() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida.");
        }
        // The existing JWT filter stores the domain User as principal. Authentication#getName
        // would otherwise use its toString(), not its username. Reload to honor active/role changes.
        User actor = (authentication.getPrincipal() instanceof User authenticatedUser
                ? users.findById(authenticatedUser.getId())
                : users.findByUsername(authentication.getName()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no disponible."));
        if (!actor.isActive() || (actor.getRole() != UserRole.ADMIN && actor.getRole() != UserRole.VENDEDOR)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario no tiene acceso al catálogo.");
        }
        return actor;
    }

    public User requireAdmin() {
        User actor = requireReader();
        if (actor.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta operación requiere el rol ADMIN.");
        }
        return actor;
    }

    public boolean isAdmin() {
        return requireReader().getRole() == UserRole.ADMIN;
    }
}
