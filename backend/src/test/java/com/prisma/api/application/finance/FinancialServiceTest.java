package com.prisma.api.application.finance;

import com.prisma.api.application.finance.dto.FinancialSummaryResponse;
import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.*;
import com.prisma.api.domain.enums.*;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialServiceTest {

    @Mock
    private FinancialTransactionRepository financialTransactionRepository;

    @Mock
    private CashRegisterRepository cashRegisterRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private FinancialService financialService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("admin", "hash", "Admin", UserRole.ADMIN);
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("Debe calcular ventas físicas, online, COGS, utilidad bruta y margen correctamente")
    void getFinancialSummary_calculatesCorrectTotals() {
        // Mock venta física (POS)
        Sale sale = new Sale();
        sale.setId(101L);
        FinancialTransaction txPos = new FinancialTransaction();
        txPos.setId(1L);
        txPos.setSale(sale);
        txPos.setTransactionType(FinancialTransactionType.IN);
        txPos.setAmount(BigDecimal.valueOf(100.00));
        txPos.setStatus(FinancialTransactionStatus.VERIFIED);
        txPos.setPaymentMethod(PaymentMethod.EFECTIVO);

        // Mock venta online (Order)
        Order order = new Order();
        order.setId(201L);
        order.setChannel(OrderChannel.WHATSAPP);
        FinancialTransaction txOnline = new FinancialTransaction();
        txOnline.setId(2L);
        txOnline.setOrder(order);
        txOnline.setTransactionType(FinancialTransactionType.IN);
        txOnline.setAmount(BigDecimal.valueOf(150.00));
        txOnline.setStatus(FinancialTransactionStatus.VERIFIED);
        txOnline.setPaymentMethod(PaymentMethod.PLIN);

        // Mock egreso compra proveedor (COGS)
        Purchase purchase = new Purchase();
        purchase.setId(301L);
        FinancialTransaction txPurchase = new FinancialTransaction();
        txPurchase.setId(3L);
        txPurchase.setPurchase(purchase);
        txPurchase.setTransactionType(FinancialTransactionType.OUT);
        txPurchase.setAmount(BigDecimal.valueOf(80.00));
        txPurchase.setStatus(FinancialTransactionStatus.VERIFIED);
        txPurchase.setPaymentMethod(PaymentMethod.TARJETA);

        when(financialTransactionRepository.findBetweenDates(any(), any()))
                .thenReturn(List.of(txPos, txOnline, txPurchase));

        FinancialSummaryResponse summary = financialService.getFinancialSummary("2026-09-01", "2026-09-30");

        assertNotNull(summary);
        assertEquals(BigDecimal.valueOf(100.00).setScale(2), summary.totalPhysicalSales());
        assertEquals(BigDecimal.valueOf(150.00).setScale(2), summary.totalOnlineSales());
        assertEquals(BigDecimal.valueOf(250.00).setScale(2), summary.totalRevenue());
        assertEquals(BigDecimal.valueOf(80.00).setScale(2), summary.totalCostOfGoodsSold());
        assertEquals(BigDecimal.valueOf(170.00).setScale(2), summary.grossProfit());
        // Margen = (170 / 250) * 100 = 68.0%
        assertEquals(68.0, summary.netMarginPercentage());
        assertEquals(3, summary.transactions().size());
    }
}
