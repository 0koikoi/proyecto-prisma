package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Pedidos
 *
 * Contrato de casos de uso para pedidos recibidos por WhatsApp, Messenger y tienda online.
 *
 * Al crear un pedido y marcarlo como PAID/PREPARING, debe:
 *   1. Descontar el stock de los productos involucrados.
 *   2. Crear InventoryMovements tipo SALIDA_PEDIDO.
 *   3. Crear un FinancialTransaction tipo INGRESO / VENTA_ONLINE.
 *
 * TODO Zully: Descomentar y completar los métodos según se implementen.
 */
public interface OrderUseCase {

    // TODO Zully: OrderResponseDto createOrder(OrderRequestDto request);
    // TODO Zully: OrderResponseDto updateOrderStatus(Long orderId, String newStatus);
    // TODO Zully: List<OrderResponseDto> getOrdersByStatus(String status);
    // TODO Zully: List<OrderResponseDto> getOrdersByChannel(String channel);
    // TODO Zully: OrderResponseDto getOrderById(Long id);
}
