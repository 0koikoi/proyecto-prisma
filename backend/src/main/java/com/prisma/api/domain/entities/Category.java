package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Entidad Category — representa cada línea de negocio de la tienda.
 * Valores esperados: "Femenina", "Urbana", "Mascotas" (configurables desde Admin).
 *
 * TODO: Implementar los campos de nombre, descripción y la relación @OneToMany con Product.
 */
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Mauricio: agregar campo 'name' (VARCHAR 100, NOT NULL, UNIQUE)
    // TODO Mauricio: agregar campo 'description' (TEXT, nullable)
    // TODO Mauricio: agregar relación @OneToMany(mappedBy = "category") con List<Product>

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // TODO Mauricio: generar getters y setters (o usar Lombok @Getter @Setter)
}
