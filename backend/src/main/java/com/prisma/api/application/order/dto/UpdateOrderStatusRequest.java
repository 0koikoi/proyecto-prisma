package com.prisma.api.application.order.dto;

import com.prisma.api.domain.enums.ShippingStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Datos requeridos para solicitar un cambio de estado en un pedido.
 */
public record UpdateOrderStatusRequest(
        @NotNull(message = "El nuevo estado es obligatorio")
        ShippingStatus toStatus,

        String reason,
        String courierCompany,
        String trackingNumber,
        String driverName,
        String driverPhone,
        String vehiclePlate,
        String shippingEvidenceKey
) {}
