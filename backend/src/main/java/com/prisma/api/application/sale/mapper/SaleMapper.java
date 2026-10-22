package com.prisma.api.application.sale.mapper;

import com.prisma.api.application.sale.dto.SaleLineResponse;
import com.prisma.api.application.sale.dto.SaleResponse;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.entities.Sale;
import com.prisma.api.domain.entities.SaleDetail;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.exceptions.BusinessRuleException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public final class SaleMapper {

    private SaleMapper() {
    }

    public static SaleResponse toResponse(Sale sale, List<SaleDetail> details, FinancialTransaction payment) {
        List<SaleLineResponse> lines = details.stream().map(SaleMapper::toLine).toList();
        BigDecimal subtotal = lines.stream()
                .map(SaleLineResponse::lineTotal)
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
        BigDecimal discount = sale.getDiscount().setScale(2, RoundingMode.HALF_UP);

        BigDecimal cashGiven = payment.getCashGiven();
        BigDecimal change = cashGiven == null
                ? BigDecimal.ZERO.setScale(2)
                : cashGiven.subtract(payment.getAmount()).setScale(2, RoundingMode.HALF_UP);

        return new SaleResponse(
                sale.getId(),
                sale.getTicketNumber(),
                sale.getCreatedAt(),
                sale.getCustomerName(),
                lines,
                subtotal,
                discount,
                subtotal.subtract(discount),
                payment.getPaymentMethod(),
                cashGiven,
                change);
    }

    /** Cobro original de la venta: el ingreso que no es una reversa. */
    public static FinancialTransaction primaryPayment(Sale sale, List<FinancialTransaction> transactions) {
        return transactions.stream()
                .filter(tx -> tx.getReversalOf() == null && tx.getTransactionType() == FinancialTransactionType.IN)
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "SALE_WITHOUT_PAYMENT", "La venta " + sale.getTicketNumber() + " no tiene un cobro registrado"));
    }

    private static SaleLineResponse toLine(SaleDetail detail) {
        BigDecimal unitPrice = detail.getUnitPrice().setScale(2, RoundingMode.HALF_UP);
        return new SaleLineResponse(
                detail.getVariant().getId(),
                detail.getVariant().getSku(),
                VariantLabel.of(detail.getVariant()),
                detail.getQuantity(),
                unitPrice,
                unitPrice.multiply(BigDecimal.valueOf(detail.getQuantity())));
    }
}
