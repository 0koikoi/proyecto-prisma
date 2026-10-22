package com.prisma.api.application.order;

import com.prisma.api.application.order.dto.*;
import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.application.port.PaymentStatusPort;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.DeliveryScope;
import com.prisma.api.domain.enums.InventoryMovementType;
import com.prisma.api.domain.enums.ReservationStatus;
import com.prisma.api.domain.enums.ShippingStatus;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.domain.repository.InventoryMovementRepository;
import com.prisma.api.domain.repository.ProductVariantRepository;
import com.prisma.api.infrastructure.persistence.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

/**
 * Servicio para creacion, consulta y gestion de pedidos digitales de la tienda.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryReservationRepository inventoryReservationRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final PaymentStatusPort paymentStatusPort;
    private final CurrentUserProvider currentUserProvider;

    public OrderService(
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            ProductVariantRepository productVariantRepository,
            InventoryReservationRepository inventoryReservationRepository,
            InventoryMovementRepository inventoryMovementRepository,
            PaymentStatusPort paymentStatusPort,
            CurrentUserProvider currentUserProvider
    ) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryReservationRepository = inventoryReservationRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.paymentStatusPort = paymentStatusPort;
        this.currentUserProvider = currentUserProvider;
    }

    // Registra un nuevo pedido digital aplicando precios del servidor e historial inicial
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Idempotencia: si la misma peticion ya fue procesada, retornar el pedido existente
        if (request.requestKey() != null) {
            Optional<Order> existing = orderRepository.findByRequestKey(request.requestKey());
            if (existing.isPresent()) {
                return getOrderById(existing.get().getId());
            }
        }

        User user = currentUserProvider.getCurrentUser();

        // Agrupar items repetidos por variante para respetar uq_order_details_order_variant
        Map<Long, Integer> consolidatedItems = new LinkedHashMap<>();
        for (OrderItemRequest item : request.items()) {
            consolidatedItems.merge(item.variantId(), item.quantity(), Integer::sum);
        }

        // Validar que todas las variantes existan y esten activas antes de crear la orden
        Map<ProductVariant, Integer> validatedVariants = new LinkedHashMap<>();
        for (Map.Entry<Long, Integer> entry : consolidatedItems.entrySet()) {
            Long variantId = entry.getKey();
            Integer quantity = entry.getValue();

            ProductVariant variant = productVariantRepository.findByIdActiveWithProduct(variantId)
                    .orElseThrow(() -> new BusinessRuleException(
                            "VARIANT_NOT_FOUND",
                            "La variante de producto con ID " + variantId + " no existe o está inactiva"
                    ));

            validatedVariants.put(variant, quantity);
        }

        // Generar codigo unico de pedido (ej. PED-2026-00001)
        String orderCode = generateOrderCode();

        Order order = new Order(
                orderCode,
                user,
                request.channel(),
                request.customerName().trim(),
                request.customerPhone().trim(),
                request.shippingAddress().trim(),
                request.reference().trim(),
                request.deliveryScope(),
                request.requestedPaymentMethod()
        );

        if (request.requestKey() != null) {
            order.setRequestKey(request.requestKey());
        }

        order.setShippingCost(request.shippingCost() != null ? request.shippingCost() : BigDecimal.ZERO);
        order.setCourierCompany(clean(request.courierCompany()));
        order.setTrackingNumber(clean(request.trackingNumber()));
        order.setDriverName(clean(request.driverName()));
        order.setDriverPhone(clean(request.driverPhone()));
        order.setVehiclePlate(clean(request.vehiclePlate()));
        order.setNotes(clean(request.notes()));

        Order savedOrder = orderRepository.save(order);

        // Guardar cada linea de detalle congelando precio y costo vigentes
        List<OrderDetail> savedDetails = new ArrayList<>();
        for (Map.Entry<ProductVariant, Integer> entry : validatedVariants.entrySet()) {
            ProductVariant variant = entry.getKey();
            Integer quantity = entry.getValue();

            OrderDetail detail = new OrderDetail(
                    savedOrder,
                    variant,
                    quantity,
                    variant.getSalePrice(),
                    variant.getCostPrice()
            );

            savedDetails.add(orderDetailRepository.save(detail));
        }

        // Registrar primer hito en la cronologia: NULL -> PENDING
        OrderStatusHistory initialHistory = new OrderStatusHistory(
                savedOrder,
                user,
                null,
                ShippingStatus.PENDING,
                "Pedido registrado por canal digital (" + request.channel() + ")"
        );
        orderStatusHistoryRepository.save(initialHistory);

        List<OrderDetailResponse> detailResponses = savedDetails.stream()
                .map(OrderDetailResponse::fromEntity)
                .toList();

        List<OrderStatusHistoryResponse> historyResponses = List.of(
                OrderStatusHistoryResponse.fromEntity(initialHistory)
        );

        return OrderResponse.fromEntity(savedOrder, detailResponses, historyResponses);
    }

    // Consulta un pedido por su identificador
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));

        List<OrderDetailResponse> details = orderDetailRepository.findByOrderIdWithVariant(id)
                .stream()
                .map(OrderDetailResponse::fromEntity)
                .toList();

        List<OrderStatusHistoryResponse> history = orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(id)
                .stream()
                .map(OrderStatusHistoryResponse::fromEntity)
                .toList();

        return OrderResponse.fromEntity(order, details, history);
    }

    // Consulta paginada con filtro opcional por estado
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(ShippingStatus status, Pageable pageable) {
        Page<Order> page = (status != null)
                ? orderRepository.findByShippingStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAllByOrderByCreatedAtDesc(pageable);

        return page.map(o -> {
            List<OrderDetailResponse> details = orderDetailRepository.findByOrderIdWithVariant(o.getId())
                    .stream()
                    .map(OrderDetailResponse::fromEntity)
                    .toList();
            return OrderResponse.fromEntity(o, details, Collections.emptyList());
        });
    }

    // Cambia el estado del pedido ejecutando reglas de negocio, reservas y kardex
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", orderId));

        ShippingStatus fromStatus = order.getShippingStatus();
        ShippingStatus toStatus = request.toStatus();

        if (fromStatus == toStatus) {
            return getOrderById(orderId);
        }

        User user = currentUserProvider.getCurrentUser();
        List<OrderDetail> details = orderDetailRepository.findByOrderIdWithVariant(orderId);

        // Validar transiciones permitidas segun RN12
        switch (toStatus) {
            case PREPARING -> handleTransitionToPreparing(order, fromStatus, details, user);
            case SHIPPED -> handleTransitionToShipped(order, fromStatus, details, request, user);
            case DELIVERED -> handleTransitionToDelivered(order, fromStatus);
            case CANCELLED -> handleTransitionToCancelled(order, fromStatus, details);
            default -> throw new BusinessRuleException(
                    "INVALID_STATUS_TRANSITION",
                    "No se permite cambiar el pedido de " + fromStatus + " a " + toStatus
            );
        }

        order.setShippingStatus(toStatus);
        orderRepository.save(order);

        // Registrar en la cronologia del pedido
        String reason = (request.reason() != null && !request.reason().trim().isEmpty())
                ? request.reason().trim()
                : "Cambio de estado a " + toStatus;

        OrderStatusHistory history = new OrderStatusHistory(order, user, fromStatus, toStatus, reason);
        orderStatusHistoryRepository.save(history);

        return getOrderById(orderId);
    }

    // PENDING -> PREPARING: Valida disponibilidad y crea reservas activas
    private void handleTransitionToPreparing(Order order, ShippingStatus fromStatus, List<OrderDetail> details, User user) {
        if (fromStatus != ShippingStatus.PENDING) {
            throw new BusinessRuleException(
                    "INVALID_TRANSITION",
                    "Solo se puede pasar a PREPARING desde el estado PENDING"
            );
        }

        // Verificar que haya stock disponible (fisico - reservas activas) para cada linea
        for (OrderDetail detail : details) {
            ProductVariant variant = detail.getVariant();
            int reserved = inventoryReservationRepository.sumReservedQuantityByVariantIdAndStatus(
                    variant.getId(),
                    ReservationStatus.ACTIVE
            );
            int available = variant.getCurrentStock() - reserved;

            if (available < detail.getQuantity()) {
                throw new BusinessRuleException(
                        "INSUFFICIENT_STOCK",
                        "Stock insuficiente para la prenda " + variant.getSku() +
                        ". Disponible: " + available + ", Solicitado: " + detail.getQuantity()
                );
            }
        }

        // Crear reservas en estado ACTIVE
        for (OrderDetail detail : details) {
            InventoryReservation reservation = new InventoryReservation(detail, user);
            inventoryReservationRepository.save(reservation);
        }
    }

    // PREPARING -> SHIPPED: Valida pago nacional (RN06), datos de transporte, descuenta stock y crea kardex
    private void handleTransitionToShipped(
            Order order,
            ShippingStatus fromStatus,
            List<OrderDetail> details,
            UpdateOrderStatusRequest request,
            User user
    ) {
        if (fromStatus != ShippingStatus.PREPARING) {
            throw new BusinessRuleException(
                    "INVALID_TRANSITION",
                    "El pedido debe estar en preparación (PREPARING) antes de despacharse"
            );
        }

        // RN06: Si es envio nacional, validar pago anticipado del 100% de la mercaderia
        if (order.getDeliveryScope() == DeliveryScope.NATIONAL) {
            boolean paid = paymentStatusPort.areProductsPaid(order.getId());
            if (!paid) {
                throw new BusinessRuleException(
                        "NATIONAL_PAYMENT_REQUIRED",
                        "Un envío nacional requiere la cancelación total de los productos antes del despacho (RN06)"
                );
            }
        }

        // Actualizar datos de transporte si vienen en la solicitud
        if (request.courierCompany() != null) order.setCourierCompany(clean(request.courierCompany()));
        if (request.trackingNumber() != null) order.setTrackingNumber(clean(request.trackingNumber()));
        if (request.driverName() != null) order.setDriverName(clean(request.driverName()));
        if (request.driverPhone() != null) order.setDriverPhone(clean(request.driverPhone()));
        if (request.vehiclePlate() != null) order.setVehiclePlate(clean(request.vehiclePlate()));
        if (request.shippingEvidenceKey() != null) order.setShippingEvidenceKey(clean(request.shippingEvidenceKey()));

        order.setShippedAt(Instant.now());

        // Consumir reservas y descontar stock fisico con kardex
        for (OrderDetail detail : details) {
            // Actualizar reserva a CONSUMED
            inventoryReservationRepository.findById(detail.getId()).ifPresent(res -> {
                res.setStatus(ReservationStatus.CONSUMED);
                res.setEndedAt(Instant.now());
                inventoryReservationRepository.save(res);
            });

            // Descontar inventario fisico
            ProductVariant variant = detail.getVariant();
            variant.setCurrentStock(variant.getCurrentStock() - detail.getQuantity());
            productVariantRepository.save(variant);

            // Registrar movimiento de kardex: ORDER_DISPATCH (cantidad negativa)
            InventoryMovement movement = new InventoryMovement(
                    variant,
                    user,
                    InventoryMovementType.ORDER_DISPATCH,
                    -detail.getQuantity(),
                    "Despacho de pedido " + order.getOrderCode()
            );
            movement.setOrderDetail(detail);
            inventoryMovementRepository.save(movement);
        }
    }

    // SHIPPED -> DELIVERED: Registra fecha de entrega
    private void handleTransitionToDelivered(Order order, ShippingStatus fromStatus) {
        if (fromStatus != ShippingStatus.SHIPPED) {
            throw new BusinessRuleException(
                    "INVALID_TRANSITION",
                    "Solo se puede marcar como entregado un pedido que ya fue despachado (SHIPPED)"
            );
        }
        order.setDeliveredAt(Instant.now());
    }

    // CANCELLED: Libera reservas activas a RELEASED
    private void handleTransitionToCancelled(Order order, ShippingStatus fromStatus, List<OrderDetail> details) {
        if (fromStatus == ShippingStatus.SHIPPED || fromStatus == ShippingStatus.DELIVERED) {
            throw new BusinessRuleException(
                    "CANNOT_CANCEL_SHIPPED_ORDER",
                    "No se puede cancelar un pedido que ya ha sido despachado o entregado"
            );
        }

        // Si estaba en PREPARING, liberar las reservas
        if (fromStatus == ShippingStatus.PREPARING) {
            for (OrderDetail detail : details) {
                inventoryReservationRepository.findById(detail.getId()).ifPresent(res -> {
                    res.setStatus(ReservationStatus.RELEASED);
                    res.setEndedAt(Instant.now());
                    inventoryReservationRepository.save(res);
                });
            }
        }
    }

    // Genera el codigo unico comercial basado en anio y correlativo
    private synchronized String generateOrderCode() {
        int year = LocalDate.now().getYear();
        long nextNum = orderRepository.count() + 1;
        return String.format("PED-%d-%05d", year, nextNum);
    }

    private String clean(String text) {
        return (text != null && !text.trim().isEmpty()) ? text.trim() : null;
    }
}
