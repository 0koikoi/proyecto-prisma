package com.prisma.api.application.order;

import com.prisma.api.application.order.dto.*;
import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.ShippingStatus;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.OrderDetailRepository;
import com.prisma.api.infrastructure.persistence.OrderRepository;
import com.prisma.api.infrastructure.persistence.OrderStatusHistoryRepository;
import com.prisma.api.infrastructure.persistence.ProductVariantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final CurrentUserProvider currentUserProvider;

    public OrderService(
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            ProductVariantRepository productVariantRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.productVariantRepository = productVariantRepository;
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
