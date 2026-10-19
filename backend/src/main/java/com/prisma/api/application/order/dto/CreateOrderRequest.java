package com.prisma.api.application.order.dto;

import com.prisma.api.domain.enums.DeliveryScope;
import com.prisma.api.domain.enums.OrderChannel;
import com.prisma.api.domain.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Datos requeridos para registrar un pedido manual o digital.
 */
public record CreateOrderRequest(
        UUID requestKey,

        @NotNull(message = "El canal del pedido es obligatorio")
        OrderChannel channel,

        @NotBlank(message = "El nombre del cliente es obligatorio")
        @Size(max = 120, message = "El nombre del cliente no puede exceder 120 caracteres")
        String customerName,

        @NotBlank(message = "El teléfono del cliente es obligatorio")
        @Size(max = 25, message = "El teléfono no puede exceder 25 caracteres")
        String customerPhone,

        @NotBlank(message = "La dirección de entrega es obligatoria")
        String shippingAddress,

        @NotBlank(message = "La referencia de entrega es obligatoria")
        String reference,

        @NotNull(message = "El ámbito de entrega (LOCAL/NATIONAL) es obligatorio")
        DeliveryScope deliveryScope,

        @NotNull(message = "El método de pago solicitado es obligatorio")
        PaymentMethod requestedPaymentMethod,

        @DecimalMin(value = "0.0", message = "El costo de envío no puede ser negativo")
        BigDecimal shippingCost,

        String courierCompany,
        String trackingNumber,
        String driverName,
        String driverPhone,
        String vehiclePlate,
        String notes,

        @NotEmpty(message = "Debe incluir al menos un producto en el pedido")
        @Valid
        List<OrderItemRequest> items
) {}
