package com.prisma.api.domain.entities;

import com.prisma.api.domain.enums.DeliveryScope;
import com.prisma.api.domain.enums.OrderChannel;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.enums.ShippingStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(name = "request_key", nullable = false, unique = true)
    private UUID requestKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 30)
    private OrderChannel channel;

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 25)
    private String customerPhone;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "reference", nullable = false, columnDefinition = "TEXT")
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_scope", nullable = false, length = 15)
    private DeliveryScope deliveryScope;

    @Column(name = "courier_company", length = 80)
    private String courierCompany;

    @Column(name = "tracking_number", length = 80)
    private String trackingNumber;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Column(name = "driver_phone", length = 25)
    private String driverPhone;

    @Column(name = "vehicle_plate", length = 15)
    private String vehiclePlate;

    @Column(name = "shipping_evidence_key", columnDefinition = "TEXT")
    private String shippingEvidenceKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "requested_payment_method", nullable = false, length = 20)
    private PaymentMethod requestedPaymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status", nullable = false, length = 20)
    private ShippingStatus shippingStatus = ShippingStatus.PENDING;

    @Column(name = "shipping_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "shipped_at")
    private Instant shippedAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public Order() {
        this.requestKey = UUID.randomUUID();
    }

    public Order(String orderCode, User createdBy, OrderChannel channel, String customerName, String customerPhone, String shippingAddress, String reference, DeliveryScope deliveryScope, PaymentMethod requestedPaymentMethod) {
        this.orderCode = orderCode;
        this.createdBy = createdBy;
        this.channel = channel;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.shippingAddress = shippingAddress;
        this.reference = reference;
        this.deliveryScope = deliveryScope;
        this.requestedPaymentMethod = requestedPaymentMethod;
        this.requestKey = UUID.randomUUID();
        this.shippingStatus = ShippingStatus.PENDING;
        this.shippingCost = BigDecimal.ZERO;
    }

    @PrePersist
    protected void onCreate() {
        if (this.requestKey == null) {
            this.requestKey = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.shippingCost == null) {
            this.shippingCost = BigDecimal.ZERO;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public UUID getRequestKey() {
        return requestKey;
    }

    public void setRequestKey(UUID requestKey) {
        this.requestKey = requestKey;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public OrderChannel getChannel() {
        return channel;
    }

    public void setChannel(OrderChannel channel) {
        this.channel = channel;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public DeliveryScope getDeliveryScope() {
        return deliveryScope;
    }

    public void setDeliveryScope(DeliveryScope deliveryScope) {
        this.deliveryScope = deliveryScope;
    }

    public String getCourierCompany() {
        return courierCompany;
    }

    public void setCourierCompany(String courierCompany) {
        this.courierCompany = courierCompany;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getDriverPhone() {
        return driverPhone;
    }

    public void setDriverPhone(String driverPhone) {
        this.driverPhone = driverPhone;
    }

    public String getVehiclePlate() {
        return vehiclePlate;
    }

    public void setVehiclePlate(String vehiclePlate) {
        this.vehiclePlate = vehiclePlate;
    }

    public String getShippingEvidenceKey() {
        return shippingEvidenceKey;
    }

    public void setShippingEvidenceKey(String shippingEvidenceKey) {
        this.shippingEvidenceKey = shippingEvidenceKey;
    }

    public PaymentMethod getRequestedPaymentMethod() {
        return requestedPaymentMethod;
    }

    public void setRequestedPaymentMethod(PaymentMethod requestedPaymentMethod) {
        this.requestedPaymentMethod = requestedPaymentMethod;
    }

    public ShippingStatus getShippingStatus() {
        return shippingStatus;
    }

    public void setShippingStatus(ShippingStatus shippingStatus) {
        this.shippingStatus = shippingStatus;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getShippedAt() {
        return shippedAt;
    }

    public void setShippedAt(Instant shippedAt) {
        this.shippedAt = shippedAt;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Order order)) return false;
        return Objects.equals(id, order.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
