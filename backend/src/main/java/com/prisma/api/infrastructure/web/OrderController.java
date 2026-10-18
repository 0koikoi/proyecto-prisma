package com.prisma.api.infrastructure.web;

import com.prisma.api.application.order.OrderService;
import com.prisma.api.application.order.dto.CreateOrderRequest;
import com.prisma.api.application.order.dto.OrderResponse;
import com.prisma.api.domain.enums.ShippingStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para el registro y consulta de pedidos digitales.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Listado paginado de pedidos con filtro opcional por estado
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(required = false) ShippingStatus status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<OrderResponse> page = orderService.getOrders(status, pageable);
        return ResponseEntity.ok(page);
    }

    // Consulta de un pedido por su identificador
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    // Registrar un nuevo pedido digital o manual
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
