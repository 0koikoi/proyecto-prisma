package com.prisma.api.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SupplierProductId implements Serializable {

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "product_id")
    private Long productId;

    public SupplierProductId() {
    }

    public SupplierProductId(Long supplierId, Long productId) {
        this.supplierId = supplierId;
        this.productId = productId;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SupplierProductId that)) return false;
        return Objects.equals(supplierId, that.supplierId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(supplierId, productId);
    }
}
