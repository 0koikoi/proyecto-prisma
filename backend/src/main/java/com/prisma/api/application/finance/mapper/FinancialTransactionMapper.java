package com.prisma.api.application.finance.mapper;

import com.prisma.api.application.finance.dto.FinancialTransactionResponse;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.enums.FinancialTransactionType;

import java.math.RoundingMode;

public final class FinancialTransactionMapper {

    private FinancialTransactionMapper() {}

    public static FinancialTransactionResponse toResponse(FinancialTransaction tx) {
        if (tx == null) return null;

        String typeStr = (tx.getTransactionType() == FinancialTransactionType.IN) ? "INGRESO" : "EGRESO";
        String channel;
        String category;
        String desc;

        if (tx.getSale() != null) {
            channel = "Presencial (POS)";
            category = "VENTA_POS";
            desc = (tx.getDescription() != null && !tx.getDescription().isBlank())
                    ? tx.getDescription()
                    : "Venta Ticket #" + tx.getSale().getId();
        } else if (tx.getOrder() != null) {
            String ch = tx.getOrder().getChannel() != null ? tx.getOrder().getChannel().name() : "Web";
            channel = "Online (" + ch + ")";
            category = "VENTA_ONLINE";
            String code = tx.getOrder().getOrderCode() != null ? tx.getOrder().getOrderCode() : tx.getOrder().getId().toString();
            String customer = tx.getOrder().getCustomerName() != null ? " (" + tx.getOrder().getCustomerName() + ")" : "";
            desc = (tx.getDescription() != null && !tx.getDescription().isBlank())
                    ? tx.getDescription()
                    : "Pedido #" + code + customer;
        } else if (tx.getPurchase() != null) {
            channel = "Compra Proveedor";
            category = "COMPRA_MERCADERIA";
            String supplierName = tx.getPurchase().getSupplier() != null
                    ? tx.getPurchase().getSupplier().getCompanyName()
                    : "Proveedor #" + tx.getPurchase().getId();
            String invoice = tx.getPurchase().getInvoiceNumber() != null
                    ? " Fact #" + tx.getPurchase().getInvoiceNumber()
                    : "";
            desc = (tx.getDescription() != null && !tx.getDescription().isBlank())
                    ? tx.getDescription()
                    : "Reposición " + supplierName + invoice;
        } else if (tx.getSaleReturn() != null) {
            channel = "Devolución Mostrador";
            category = "DEVOLUCION";
            desc = (tx.getDescription() != null && !tx.getDescription().isBlank())
                    ? tx.getDescription()
                    : "Devolución mostrador";
        } else {
            if (tx.getTransactionType() == FinancialTransactionType.IN) {
                channel = "Otros Ingresos";
                category = "OTROS_INGRESOS";
            } else {
                channel = "Gastos / Retiros";
                category = "OTROS_EGRESOS";
            }
            desc = (tx.getDescription() != null && !tx.getDescription().isBlank())
                    ? tx.getDescription()
                    : "Movimiento financiero #" + tx.getId();
        }

        String methodStr = tx.getPaymentMethod() != null ? tx.getPaymentMethod().name() : "OTRO";

        return new FinancialTransactionResponse(
                tx.getId(),
                tx.getCreatedAt(),
                typeStr,
                channel,
                category,
                methodStr,
                tx.getAmount().setScale(2, RoundingMode.HALF_UP),
                desc
        );
    }
}
