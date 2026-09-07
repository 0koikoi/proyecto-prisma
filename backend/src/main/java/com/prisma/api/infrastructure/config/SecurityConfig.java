package com.prisma.api.infrastructure.config;

import org.springframework.context.annotation.Configuration;

/**
 * RESPONSABLE: Keila
 * MÓDULO: Configuración de Seguridad y JWT (Spring Security)
 *
 * PLANIFICACIÓN: Sprint 6 (Semanas 11-12)
 *
 * PASOS PARA ACTIVAR SPRING SECURITY EN SPRINT 6:
 *  1. Agregar la dependencia en backend/pom.xml:
 *     <dependency>
 *         <groupId>org.springframework.boot</groupId>
 *         <artifactId>spring-boot-starter-security</artifactId>
 *     </dependency>
 *     <dependency>
 *         <groupId>io.jsonwebtoken</groupId>
 *         <artifactId>jjwt-api</artifactId>
 *         <version>0.12.6</version>
 *     </dependency>
 *
 *  2. Configurar la cadena de filtros (SecurityFilterChain):
 *     - Permitir libre acceso a: /api/auth/** y endpoints públicos del catálogo.
 *     - Proteger con JWT: /api/finance/** y /api/settings/** (exclusivo rol ADMIN).
 *     - Proteger con autenticación: /api/sales/**, /api/cash-register/**, /api/orders/**.
 *
 *  3. Inyectar el PasswordEncoder (BCryptPasswordEncoder) para almacenar contraseñas seguras (RNF04).
 */
@Configuration
public class SecurityConfig {
    // TODO Keila: Implementar SecurityFilterChain y JwtAuthenticationFilter en Sprint 6
}
