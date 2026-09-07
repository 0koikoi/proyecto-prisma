package com.prisma.api.infrastructure.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * RESPONSABLE: Keila
 * MÓDULO: Autenticación y Seguridad (REST Controller)
 *
 * Endpoints HTTP para inicio de sesión y validación de sesión (RF01 / RF02):
 *  - POST /api/auth/login  -> Valida credenciales con BCrypt y emite token JWT
 *  - GET  /api/auth/me     -> Retorna el perfil del usuario autenticado actual
 *
 * TODO Keila:
 *  - Integrar AuthenticationManager de Spring Security.
 *  - Generar el token JWT con claims (username, role).
 *  - Devolver el token en la respuesta para que el frontend lo guarde en localStorage.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // TODO Keila: reemplazar por autenticación real vía Spring Security + BCrypt
        if ("admin".equals(username) && "admin123".equals(password)) {
            return ResponseEntity.ok(Map.of(
                "token", "mock-jwt-token-admin-prisma-2026",
                "user", Map.of(
                    "id", 1,
                    "username", "admin",
                    "name", "Dueña Prisma (Admin)",
                    "role", "ADMIN"
                )
            ));
        }

        if ("vendedor".equals(username) && "vendedor123".equals(password)) {
            return ResponseEntity.ok(Map.of(
                "token", "mock-jwt-token-vendedor-prisma-2026",
                "user", Map.of(
                    "id", 2,
                    "username", "vendedor",
                    "name", "Personal Mostrador",
                    "role", "VENDEDOR"
                )
            ));
        }

        return ResponseEntity.status(401).body(Map.of(
            "message", "Credenciales incorrectas. Verifique usuario y contraseña."
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // TODO Keila: extraer usuario del JWT token
        return ResponseEntity.ok(Map.of(
            "username", "admin",
            "name", "Dueña Prisma",
            "role", "ADMIN"
        ));
    }
}
