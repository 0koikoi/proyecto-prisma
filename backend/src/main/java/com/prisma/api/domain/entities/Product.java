package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Entidad Product — pieza central del sistema. Representa cada artículo del catálogo.
 * Está relacionada con Category, Supplier, SaleDetail, OrderDetail y InventoryMovement.
 *
 * CAMPOS CLAVE:
 *  - sku: código corto visible para el personal (ej. "URB-001")
 *  - barcode: código EAN/UPC leído por el escáner USB (opcional — el POS funciona sin él)
 *  - costPrice: precio de compra al proveedor. REQUERIDO para calcular márgenes en Dashboard.
 *  - salePrice: precio de venta al público.
 *  - currentStock: stock en tiempo real. Se actualiza vía transacciones, nunca directamente.
 *  - minStockAlert: umbral de alerta de stock bajo (RF05).
 *
 * TODO Mauricio: Completar todos los campos indicados abajo.
 * TODO Mauricio: Relacionar con Category (@ManyToOne) y Supplier (@ManyToOne, nullable).
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Mauricio: String sku — NOT NULL, UNIQUE. Ej: "FEM-001"
    // TODO Mauricio: String name — NOT NULL. Nombre del producto visible en POS
    // TODO Mauricio: String description — nullable, descripción corta
    // TODO Mauricio: String barcode — nullable (código EAN leído por scanner USB)
    // TODO Mauricio: String imageUrl — URL de la foto del producto
    // TODO Mauricio: BigDecimal costPrice — NOT NULL, precio de compra al proveedor
    // TODO Mauricio: BigDecimal salePrice — NOT NULL, precio de venta al público
    // TODO Mauricio: Integer currentStock — NOT NULL, default 0
    // TODO Mauricio: Integer minStockAlert — NOT NULL, default 3
    // TODO Mauricio: Boolean isActive — default true, para dar de baja sin borrar

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "category_id", nullable = false)
    // TODO Mauricio: private Category category;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "supplier_id")
    // TODO Mauricio: private Supplier supplier; (nullable — puede no tener proveedor aún)

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // TODO Mauricio: generar getters y setters, o agregar @Getter @Setter de Lombok
}
