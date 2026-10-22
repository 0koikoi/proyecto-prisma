package com.prisma.api.application.order.dto;

import com.prisma.api.domain.entities.Order;
import com.prisma.api.domain.enums.DeliveryScope;
import com.prisma.api.domain.enums.OrderChannel;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.enums.ShippingStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Respuesta completa de un pedido con lineas de productos y datos logisticos.
 */
public record OrderResponse(
        Long id,
        String orderCode,
        UUID requestKey,
        String createdByName,
        OrderChannel channel,
        String customerName,
        String customerPhone,
        String shippingAddress,
        String reference,
        DeliveryScope deliveryScope,
        String courierCompany,
        String trackingNumber,
        String driverName,
        String driverPhone,
        String vehiclePlate,
        String shippingEvidenceKey,
        PaymentMethod requestedPaymentMethod,
        ShippingStatus shippingStatus,
        BigDecimal shippingCost,
        BigDecimal totalProducts,
        BigDecimal totalOrder,
        Instant createdAt,
        Instant shippedAt,
        Instant deliveredAt,
        String notes,
        List<OrderDetailResponse> items,
        List<OrderStatusHistoryResponse> history
) {
    // Convierte un Order y sus lineas calculadas a OrderResponse
    public static OrderResponse fromEntity(
            Order order,
            List<OrderDetailResponse> items,
            List<OrderStatusHistoryResponse> history
    ) {
        BigDecimal totalProducts = items.stream()
                .map(OrderDetailResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOrder = totalProducts.add(
                order.getShippingCost() != null ? order.getShippingCost() : BigDecimal.ZERO
        );

        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getRequestKey(),
                order.getCreatedBy() != null ? order.getCreatedBy().getFullName() : null,
                order.getChannel(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getShippingAddress(),
                order.getReference(),
                order.getDeliveryScope(),
                order.getCourierCompany(),
                order.getTrackingNumber(),
                order.getDriverName(),
                order.getDriverPhone(),
                order.getVehiclePlate(),
                order.getShippingEvidenceKey(),
                order.getRequestedPaymentMethod(),
                order.getShippingStatus(),
                order.getShippingCost(),
                totalProducts,
                totalOrder,
                order.getCreatedAt(),
                order.getShippedAt(),
                order.getDeliveredAt(),
                order.getNotes(),
                items,
                history
        );
    }
}
