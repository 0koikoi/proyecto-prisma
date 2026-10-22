package com.prisma.api.application.sale;

import com.prisma.api.application.sale.dto.SaleResponse;
import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.entities.Product;
import com.prisma.api.domain.entities.ProductVariant;
import com.prisma.api.domain.entities.Sale;
import com.prisma.api.domain.entities.SaleDetail;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.CashRegisterStatus;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import com.prisma.api.infrastructure.persistence.SaleDetailRepository;
import com.prisma.api.infrastructure.persistence.SaleRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleQueryServiceTest {

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private SaleDetailRepository saleDetailRepository;
    @Mock
    private CashRegisterRepository cashRegisterRepository;
    @Mock
    private FinancialTransactionRepository financialTransactionRepository;

    @InjectMocks
    private SaleQueryService saleQueryService;

    private User user;
    private CashRegister register;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        user = new User("vendedor", "hash", "Leo Vendedor", UserRole.VENDEDOR);
        user.setId(2L);
        register = new CashRegister(user, new BigDecimal("100.00"));
        register.setId(10L);
        Product product = new Product();
        product.setName("Polera Oversize");
        variant = new ProductVariant(product, "URB-001", "UNICA", "SIN_COLOR",
                new BigDecimal("30.0000"), new BigDecimal("50.00"), 5);
        variant.setId(1L);
    }

    private Sale sale(long id, String ticket) {
        Sale sale = new Sale(ticket, register, user, null, BigDecimal.ZERO);
        sale.setId(id);
        return sale;
    }

    private SaleDetail detail(Sale sale, int quantity) {
        return new SaleDetail(sale, variant, quantity, new BigDecimal("50.00"), new BigDecimal("30.0000"));
    }

    private FinancialTransaction payment(Sale sale, PaymentMethod method, String amount) {
        FinancialTransaction tx = new FinancialTransaction(user, FinancialTransactionType.IN, new BigDecimal(amount), method);
        tx.setSale(sale);
        return tx;
    }

    @Test
    @DisplayName("Sin turno abierto la lista de ventas del turno está vacía")
    void listCurrentShift_isEmpty_whenNoOpenRegister() {
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.empty());

        assertTrue(saleQueryService.listCurrentShift().isEmpty());
        verifyNoInteractions(saleRepository);
    }

    @Test
    @DisplayName("Las ventas del turno vuelven de la más reciente a la más antigua, cada una con sus líneas y su cobro")
    void listCurrentShift_returnsEachSaleWithItsOwnDetailsAndPayment() {
        Sale older = sale(1L, "TK-000001");
        Sale newer = sale(2L, "TK-000002");
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.of(register));
        when(saleRepository.findByCashRegisterIdOrderByIdDesc(10L)).thenReturn(List.of(newer, older));
        when(saleDetailRepository.findAllBySaleIds(List.of(2L, 1L)))
                .thenReturn(List.of(detail(older, 1), detail(newer, 3)));
        when(financialTransactionRepository.findBySaleIdIn(List.of(2L, 1L)))
                .thenReturn(List.of(payment(older, PaymentMethod.YAPE, "50.00"), payment(newer, PaymentMethod.PLIN, "150.00")));

        List<SaleResponse> sales = saleQueryService.listCurrentShift();

        assertEquals(List.of("TK-000002", "TK-000001"), sales.stream().map(SaleResponse::ticketNumber).toList());
        assertEquals(new BigDecimal("150.00"), sales.get(0).total());
        assertEquals(PaymentMethod.PLIN, sales.get(0).paymentMethod());
        assertEquals(3, sales.get(0).items().get(0).quantity());
        assertEquals(new BigDecimal("50.00"), sales.get(1).total());
        assertEquals(PaymentMethod.YAPE, sales.get(1).paymentMethod());
    }

    @Test
    @DisplayName("Una venta por id devuelve el detalle completo para reimprimir el ticket")
    void getById_returnsSaleDetail() {
        Sale sale = sale(7L, "TK-000007");
        when(saleRepository.findById(7L)).thenReturn(Optional.of(sale));
        when(saleDetailRepository.findBySaleIdOrderByIdAsc(7L)).thenReturn(List.of(detail(sale, 2)));
        when(financialTransactionRepository.findBySaleId(7L)).thenReturn(List.of(payment(sale, PaymentMethod.YAPE, "100.00")));

        SaleResponse response = saleQueryService.getById(7L);

        assertEquals("TK-000007", response.ticketNumber());
        assertEquals(new BigDecimal("100.00"), response.total());
        assertEquals("Polera Oversize", response.items().get(0).name());
    }

    @Test
    @DisplayName("Una venta inexistente responde 404")
    void getById_throwsNotFound_whenSaleDoesNotExist() {
        when(saleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> saleQueryService.getById(99L));
    }
}
