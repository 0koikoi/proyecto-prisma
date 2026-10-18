package com.prisma.api.infrastructure.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] CATALOG_ENDPOINTS = {
            "/api/categories", "/api/categories/**", "/api/products", "/api/products/**",
            "/api/variants", "/api/variants/**", "/api/inventory", "/api/inventory/**"
    };

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(AbstractHttpConfigurer::disable)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setHeader("WWW-Authenticate", "Bearer");
                            writeSecurityError(response, 401, "UNAUTHORIZED", "Autenticación requerida o token inválido.");
                        })
                        .accessDeniedHandler((request, response, exception) ->
                                writeSecurityError(response, 403, "FORBIDDEN", "No tiene permisos para esta operación.")))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos de autenticación
                        .requestMatchers("/api/auth/**").permitAll()
                        // Pre-flight OPTIONS CORS permitidos
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, CATALOG_ENDPOINTS).hasAnyRole("ADMIN", "VENDEDOR")
                        .requestMatchers(HttpMethod.HEAD, CATALOG_ENDPOINTS).hasAnyRole("ADMIN", "VENDEDOR")
                        .requestMatchers(CATALOG_ENDPOINTS).hasRole("ADMIN")
                        // Todos los demás endpoints requieren autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    private static void writeSecurityError(HttpServletResponse response, int status, String code, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        // Only fixed server messages are written here; request and exception data are never serialized.
        response.getWriter().write("{\"status\":" + status + ",\"code\":\"" + code
                + "\",\"message\":\"" + message + "\",\"fieldErrors\":{}}");
    }
}
