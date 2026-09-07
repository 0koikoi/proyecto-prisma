package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos
 *
 * Entidad Order — representa una venta recibida por WhatsApp, Messenger o tienda online.
 * Es diferente a Sale (que es la venta presencial en el POS).
 *
 * FLUJO DE ESTADOS:
 *   PENDING → PREPARING → SHIPPED → DELIVERED  (también puede ir a CANCELLED)
 *
 * COURIERS USADOS POR TIENDA PRISMA:
 *   - Shalom (envíos nacionales)
 *   - Comité 6 (local, envía placa y contacto del conductor)
 *   - Motorizado local
 *
 * RELACIONES:
 *  - @OneToMany OrderDetail — productos del pedido
 *
 * TODO Zully: Completar todos los campos indicados abajo.
 * TODO Zully: Agregar relación @OneToMany con List<OrderDetail>.
 */
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Zully: String orderCode — NOT NULL, UNIQUE. Ej: "ORD-0001"
    // TODO Zully: String channel — enum: WHATSAPP | MESSENGER | TIENDA_ONLINE
    // TODO Zully: String customerName — NOT NULL
    // TODO Zully: String customerPhone — NOT NULL
    // TODO Zully: String shippingAddress — NOT NULL
    // TODO Zully: String reference — nullable. Referencia de la dirección (ej: "frente a bodega azul")
    // TODO Zully: String courierCompany — nullable. "Shalom" | "Comité 6" | "Motorizado"
    // TODO Zully: String trackingNumber — nullable. Guía Shalom o placa Comité 6
    // TODO Zully: String paymentMethod — enum: YAPE | PLIN | TRANSFERENCIA | CONTRAENTREGA
    // TODO Zully: String paymentStatus — enum: PENDING | PAID | VERIFIED. Default: PENDING
    // TODO Zully: String shippingStatus — enum: PENDING | PREPARING | SHIPPED | DELIVERED | CANCELLED. Default: PENDING
    // TODO Zully: BigDecimal shippingCost — default 0.00
    // TODO Zully: BigDecimal totalProducts — NOT NULL
    // TODO Zully: BigDecimal totalOrder — NOT NULL (totalProducts + shippingCost)
    // TODO Zully: String notes — nullable. Notas internas del pedido
    // TODO Zully: LocalDateTime createdAt — default now()
    // TODO Zully: LocalDateTime shippedAt — nullable, fecha de despacho real

    // @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    // TODO Zully: private List<OrderDetail> details;

    // TODO Zully: generar getters y setters
}
