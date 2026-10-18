package com.prisma.api.application.order;

import com.prisma.api.application.order.dto.CreateOrderRequest;
import com.prisma.api.application.order.dto.OrderItemRequest;
import com.prisma.api.application.order.dto.OrderResponse;
import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.*;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.infrastructure.persistence.OrderDetailRepository;
import com.prisma.api.infrastructure.persistence.OrderRepository;
import com.prisma.api.infrastructure.persistence.OrderStatusHistoryRepository;
import com.prisma.api.infrastructure.persistence.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private OrderService orderService;

    private User sampleUser;
    private ProductVariant sampleVariant;

    @BeforeEach
    void setUp() {
        sampleUser = new User("vendedor1", "hash", "Lucia Vendedora", UserRole.VENDEDOR);
        sampleUser.setId(2L);

        Category cat = new Category("Ropa Urbana", "Categoria");
        Product prod = new Product(cat, "Polera Oversize Urban", "Desc", null);
        prod.setId(5L);

        sampleVariant = new ProductVariant(prod, "URB-001", "M", "Negro", new BigDecimal("35.00"), new BigDecimal("69.90"), 10);
        sampleVariant.setId(100L);
    }

    @Test
    @DisplayName("Debe crear un pedido exitosamente con precio congelado del servidor y estado PENDING")
    void createOrderSuccess() {
        UUID reqKey = UUID.randomUUID();
        CreateOrderRequest request = new CreateOrderRequest(
                reqKey,
                OrderChannel.WHATSAPP,
                "Lucia Morales",
                "987654321",
                "Jr. Dos de Mayo 450",
                "Frente al parque",
                DeliveryScope.LOCAL,
                PaymentMethod.YAPE,
                new BigDecimal("6.00"),
                "Motorizado Local",
                "Reparto Express",
                null,
                null,
                null,
                "Llamar al llegar",
                List.of(new OrderItemRequest(100L, 2))
        );

        when(orderRepository.findByRequestKey(reqKey)).thenReturn(Optional.empty());
        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(productVariantRepository.findByIdActiveWithProduct(100L)).thenReturn(Optional.of(sampleVariant));
        when(orderRepository.count()).thenReturn(5L);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(10L);
            return o;
        });

        when(orderDetailRepository.save(any(OrderDetail.class))).thenAnswer(inv -> {
            OrderDetail d = inv.getArgument(0);
            d.setId(50L);
            return d;
        });

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("Lucia Morales", response.customerName());
        assertEquals(ShippingStatus.PENDING, response.shippingStatus());
        assertEquals(new BigDecimal("139.80"), response.totalProducts()); // 2 * 69.90
        assertEquals(new BigDecimal("145.80"), response.totalOrder());    // 139.80 + 6.00

        verify(orderStatusHistoryRepository).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("Debe garantizar idempotencia: retorna pedido existente si requestKey ya fue procesada")
    void createOrderIdempotency() {
        UUID reqKey = UUID.randomUUID();
        CreateOrderRequest request = new CreateOrderRequest(
                reqKey,
                OrderChannel.WHATSAPP,
                "Lucia Morales",
                "987654321",
                "Jr. Dos de Mayo 450",
                "Frente al parque",
                DeliveryScope.LOCAL,
                PaymentMethod.YAPE,
                BigDecimal.ZERO,
                null, null, null, null, null, null,
                List.of(new OrderItemRequest(100L, 1))
        );

        Order existingOrder = new Order("PED-2026-00005", sampleUser, OrderChannel.WHATSAPP, "Lucia Morales", "987654321", "Jr. Dos de Mayo", "Ref", DeliveryScope.LOCAL, PaymentMethod.YAPE);
        existingOrder.setId(5L);
        existingOrder.setRequestKey(reqKey);

        when(orderRepository.findByRequestKey(reqKey)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.findById(5L)).thenReturn(Optional.of(existingOrder));
        when(orderDetailRepository.findByOrderIdWithVariant(5L)).thenReturn(List.of());
        when(orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(5L)).thenReturn(List.of());

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(5L, response.id());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe rechazar la creacion si una variante no existe")
    void createOrderFailsWhenVariantNotFound() {
        CreateOrderRequest request = new CreateOrderRequest(
                UUID.randomUUID(),
                OrderChannel.WHATSAPP,
                "Lucia Morales",
                "987654321",
                "Direccion",
                "Referencia",
                DeliveryScope.LOCAL,
                PaymentMethod.YAPE,
                BigDecimal.ZERO,
                null, null, null, null, null, null,
                List.of(new OrderItemRequest(999L, 1))
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(sampleUser);
        when(productVariantRepository.findByIdActiveWithProduct(999L)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> orderService.createOrder(request));
        assertEquals("VARIANT_NOT_FOUND", ex.getCode());
        verify(orderRepository, never()).save(any());
    }
}
