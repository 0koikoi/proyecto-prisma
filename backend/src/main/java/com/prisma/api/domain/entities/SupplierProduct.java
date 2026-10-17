package com.prisma.api.domain.entities;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "supplier_products")
public class SupplierProduct {

    @EmbeddedId
    private SupplierProductId id = new SupplierProductId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("supplierId")
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public SupplierProduct() {
    }

    public SupplierProduct(Supplier supplier, Product product) {
        this.supplier = supplier;
        this.product = product;
        this.id = new SupplierProductId(supplier.getId(), product.getId());
    }

    public SupplierProductId getId() {
        return id;
    }

    public void setId(SupplierProductId id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
        if (this.id != null && supplier != null) {
            this.id.setSupplierId(supplier.getId());
        }
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
        if (this.id != null && product != null) {
            this.id.setProductId(product.getId());
        }
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SupplierProduct that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
