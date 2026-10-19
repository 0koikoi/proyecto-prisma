package com.prisma.api.application.order.dto;

import com.prisma.api.domain.entities.OrderStatusHistory;

import java.time.Instant;

/**
 * Registro de un cambio de estado en la cronologia del pedido.
 */
public record OrderStatusHistoryResponse(
        Long id,
        String fromStatus,
        String toStatus,
        String changedByName,
        Instant changedAt,
        String reason
) {
    // Mapea la entidad OrderStatusHistory a su DTO de cronologia
    public static OrderStatusHistoryResponse fromEntity(OrderStatusHistory history) {
        return new OrderStatusHistoryResponse(
                history.getId(),
                history.getFromStatus() != null ? history.getFromStatus().name() : null,
                history.getToStatus().name(),
                history.getChangedBy() != null ? history.getChangedBy().getFullName() : "Sistema",
                history.getChangedAt(),
                history.getReason()
        );
    }
}
