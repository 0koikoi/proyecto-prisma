package com.prisma.api.application.port;

/**
 * Puerto de consulta para conocer el estado financiero de un pedido (RN06).
 */
public interface PaymentStatusPort {

    // Indica si el importe de los productos de un pedido ha sido pagado al 100%
    boolean areProductsPaid(Long orderId);
}
