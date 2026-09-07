package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Keila
 * MÓDULO: Autenticación y Control de Roles (RF01 / RF02)
 *
 * Entidad User — representa al personal autorizado del sistema.
 * Solo dos roles permitidos:
 *  - ADMIN: Dueña del negocio, acceso total a reportes y configuración.
 *  - VENDEDOR: Personal de mostrador, acceso a POS, Caja y Pedidos.
 *
 * NOTA DE SEGURIDAD (RNF04):
 *  - passwordHash almacena la contraseña procesada con BCrypt, jamás texto plano.
 *
 * TODO Keila: Completar los atributos, constructores y getters/setters.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String role; // 'ADMIN' o 'VENDEDOR'

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public User() {}

    public User(String username, String passwordHash, String fullName, String role) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.isActive = true;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
