package com.prisma.api.infrastructure.persistence;

import com.prisma.api.application.port.PaymentStatusPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Adaptador que consulta la vista v_order_payment_status de PostgreSQL en Neon.
 */
@Component
public class SqlPaymentStatusAdapter implements PaymentStatusPort {

    private final JdbcTemplate jdbcTemplate;

    public SqlPaymentStatusAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean areProductsPaid(Long orderId) {
        String sql = "SELECT COALESCE(products_paid, false) FROM v_order_payment_status WHERE order_id = ?";
        try {
            Boolean paid = jdbcTemplate.queryForObject(sql, Boolean.class, orderId);
            return Boolean.TRUE.equals(paid);
        } catch (Exception e) {
            // Si no hay filas asociadas aun, el pedido no ha sido pagado
            return false;
        }
    }
}
