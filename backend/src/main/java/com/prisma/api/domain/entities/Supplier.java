package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores
 *
 * Entidad Supplier — directorio de proveedores (talleres de Gamarra, distribuidores, etc.).
 * La relación principal es con Product (un proveedor abastece múltiples productos) y
 * con Purchase (cada compra de mercadería se asocia a un proveedor).
 *
 * CAMPOS CLAVE:
 *  - taxId: RUC o DNI del proveedor (para facturación y trazabilidad)
 *  - phone/email: datos de contacto directo para reposición de stock
 *
 * TODO Zully: Completar todos los campos indicados abajo.
 * TODO Zully: Agregar relación @OneToMany con List<Purchase> (historial de reposiciones).
 */
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO Zully: String companyName — NOT NULL. Razón social del proveedor
    // TODO Zully: String contactName — nullable. Nombre de la persona de contacto
    // TODO Zully: String phone — NOT NULL. Teléfono principal
    // TODO Zully: String email — nullable
    // TODO Zully: String address — nullable. Dirección física (Gamarra, piso, stand)
    // TODO Zully: String taxId — nullable. RUC o DNI del proveedor
    // TODO Zully: String notes — nullable. Notas internas sobre el proveedor

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // TODO Zully: generar getters y setters, o agregar @Getter @Setter de Lombok
}
