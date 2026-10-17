package com.prisma.api.domain.entities;

import com.prisma.api.domain.enums.PurchaseStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "request_key", nullable = false, unique = true)
    private UUID requestKey;

    @Column(name = "invoice_number", length = 80)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PurchaseStatus status = PurchaseStatus.DRAFT;

    @Column(name = "purchased_at", nullable = false)
    private Instant purchasedAt = Instant.now();

    @Column(name = "received_at")
    private Instant receivedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public Purchase() {
        this.requestKey = UUID.randomUUID();
    }

    public Purchase(Supplier supplier, User createdBy, UUID requestKey, String invoiceNumber) {
        this.supplier = supplier;
        this.createdBy = createdBy;
        this.requestKey = (requestKey != null) ? requestKey : UUID.randomUUID();
        this.invoiceNumber = invoiceNumber;
    }

    @PrePersist
    protected void onCreate() {
        if (this.requestKey == null) {
            this.requestKey = UUID.randomUUID();
        }
        if (this.purchasedAt == null) {
            this.purchasedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public UUID getRequestKey() {
        return requestKey;
    }

    public void setRequestKey(UUID requestKey) {
        this.requestKey = requestKey;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public PurchaseStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseStatus status) {
        this.status = status;
    }

    public Instant getPurchasedAt() {
        return purchasedAt;
    }

    public void setPurchasedAt(Instant purchasedAt) {
        this.purchasedAt = purchasedAt;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
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
        if (!(o instanceof Purchase purchase)) return false;
        return Objects.equals(id, purchase.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
