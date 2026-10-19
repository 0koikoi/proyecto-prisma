package com.prisma.api.domain.entities;

import com.prisma.api.domain.enums.ReservationStatus;
import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "inventory_reservations")
public class InventoryReservation implements Persistable<Long> {

    @Id
    @Column(name = "order_detail_id")
    private Long orderDetailId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "order_detail_id", nullable = false)
    private OrderDetail orderDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private ReservationStatus status = ReservationStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "ended_at")
    private Instant endedAt;

    @Transient
    private boolean isNew = true;

    public InventoryReservation() {
        this.isNew = false;
    }

    public InventoryReservation(OrderDetail orderDetail, User createdBy) {
        this.orderDetail = orderDetail;
        this.createdBy = createdBy;
        this.status = ReservationStatus.ACTIVE;
        this.createdAt = Instant.now();
        if (orderDetail != null) {
            this.orderDetailId = orderDetail.getId();
        }
        this.isNew = true;
    }

    @Override
    public Long getId() {
        return orderDetailId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostPersist
    @PostLoad
    void markNotNew() {
        this.isNew = false;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.orderDetail != null && this.orderDetailId == null) {
            this.orderDetailId = this.orderDetail.getId();
        }
    }

    public Long getOrderDetailId() {
        return orderDetailId;
    }

    public void setOrderDetailId(Long orderDetailId) {
        this.orderDetailId = orderDetailId;
    }

    public OrderDetail getOrderDetail() {
        return orderDetail;
    }

    public void setOrderDetail(OrderDetail orderDetail) {
        this.orderDetail = orderDetail;
        if (orderDetail != null) {
            this.orderDetailId = orderDetail.getId();
        }
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InventoryReservation that = (InventoryReservation) o;
        return Objects.equals(orderDetailId, that.orderDetailId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderDetailId);
    }
}
