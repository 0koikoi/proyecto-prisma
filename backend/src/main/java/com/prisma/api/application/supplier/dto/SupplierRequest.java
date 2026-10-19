package com.prisma.api.application.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos requeridos para registrar o actualizar un proveedor.
 */
public record SupplierRequest(
        @NotBlank(message = "La razón social es obligatoria")
        @Size(max = 150, message = "La razón social no puede exceder 150 caracteres")
        String companyName,

        @Size(max = 100, message = "El nombre de contacto no puede exceder 100 caracteres")
        String contactName,

        @NotBlank(message = "El teléfono es obligatorio")
        @Size(max = 25, message = "El teléfono no puede exceder 25 caracteres")
        String phone,

        @Email(message = "El formato del correo electrónico es inválido")
        @Size(max = 254, message = "El correo no puede exceder 254 caracteres")
        String email,

        String address,

        @Size(max = 12, message = "El tipo de documento no puede exceder 12 caracteres")
        String taxIdType,

        @Size(max = 20, message = "El número de documento no puede exceder 20 caracteres")
        String taxId,

        String notes
) {}
