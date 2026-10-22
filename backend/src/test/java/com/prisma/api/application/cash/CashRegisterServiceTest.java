package com.prisma.api.application.cash;

import com.prisma.api.application.cash.dto.CashRegisterStatusResponse;
import com.prisma.api.application.cash.dto.CloseCashRegisterRequest;
import com.prisma.api.application.cash.dto.CloseCashRegisterResponse;
import com.prisma.api.application.cash.dto.OpenCashRegisterRequest;
import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.CashRegisterStatus;
import com.prisma.api.domain.enums.FinancialTransactionStatus;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.enums.UserRole;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CashRegisterServiceTest {

    @Mock
    private CashRegisterRepository cashRegisterRepository;
    @Mock
    private FinancialTransactionRepository financialTransactionRepository;
    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private CashRegisterService cashRegisterService;

    private User user;
    private CashRegister openRegister;

    @BeforeEach
    void setUp() {
        user = new User("vendedor", "hash", "Leo Vendedor", UserRole.VENDEDOR);
        user.setId(2L);
        openRegister = new CashRegister(user, new BigDecimal("100.00"));
        openRegister.setId(10L);

        lenient().when(currentUserProvider.getCurrentUser()).thenReturn(user);
    }

    private static FinancialTransactionRepository.MethodTotal total(
            PaymentMethod method, FinancialTransactionType type, String amount) {
        return new FinancialTransactionRepository.MethodTotal() {
            @Override
            public PaymentMethod getPaymentMethod() {
                return method;
            }

            @Override
            public FinancialTransactionType getTransactionType() {
                return type;
            }

            @Override
            public BigDecimal getTotal() {
                return new BigDecimal(amount);
            }
        };
    }

    private void stubTotals() {
        when(financialTransactionRepository.totalsByRegister(10L, FinancialTransactionStatus.VERIFIED))
                .thenReturn(List.of(
                        total(PaymentMethod.EFECTIVO, FinancialTransactionType.IN, "150.00"),
                        total(PaymentMethod.EFECTIVO, FinancialTransactionType.OUT, "20.00"),
                        total(PaymentMethod.YAPE, FinancialTransactionType.IN, "210.00"),
                        total(PaymentMethod.PLIN, FinancialTransactionType.IN, "70.00")));
    }

    @Test
    @DisplayName("Abrir caja registra al responsable y el sencillo inicial")
    void open_createsRegisterForCurrentUser() {
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.empty());
        when(cashRegisterRepository.saveAndFlush(any(CashRegister.class))).thenAnswer(inv -> {
            CashRegister saved = inv.getArgument(0);
            saved.setId(10L);
            return saved;
        });
        when(financialTransactionRepository.totalsByRegister(10L, FinancialTransactionStatus.VERIFIED))
                .thenReturn(List.of());

        CashRegisterStatusResponse status = cashRegisterService.open(new OpenCashRegisterRequest(new BigDecimal("100.00")));

        assertTrue(status.open());
        assertEquals(10L, status.registerId());
        assertEquals("Leo Vendedor", status.openedBy());
        assertEquals(new BigDecimal("100.00"), status.initialCash());
        assertEquals(new BigDecimal("100.00"), status.expectedCash());
    }

    @Test
    @DisplayName("No se puede abrir una segunda caja mientras haya una abierta (RN08)")
    void open_rejects_whenAnotherRegisterIsOpen() {
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.of(openRegister));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> cashRegisterService.open(new OpenCashRegisterRequest(new BigDecimal("50.00"))));

        assertEquals("CASH_ALREADY_OPEN", ex.getCode());
        verify(cashRegisterRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Si dos aperturas compiten, la restricción única de la base se traduce a regla de negocio")
    void open_translatesUniqueIndexViolation() {
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.empty());
        when(cashRegisterRepository.saveAndFlush(any(CashRegister.class)))
                .thenThrow(new DataIntegrityViolationException("uq_cash_registers_single_open"));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> cashRegisterService.open(new OpenCashRegisterRequest(new BigDecimal("50.00"))));

        assertEquals("CASH_ALREADY_OPEN", ex.getCode());
    }

    @Test
    @DisplayName("Sin turno abierto el estado vuelve cerrado y con totales en cero")
    void status_whenNoOpenRegister_isClosed() {
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.empty());

        CashRegisterStatusResponse status = cashRegisterService.getStatus();

        assertFalse(status.open());
        assertNull(status.registerId());
        assertEquals(BigDecimal.ZERO.setScale(2), status.totalCashSales());
        assertEquals(BigDecimal.ZERO.setScale(2), status.expectedCash());
    }

    @Test
    @DisplayName("El estado suma cobros por método neto de egresos y calcula el efectivo esperado (RN09)")
    void status_aggregatesTotalsByPaymentMethod() {
        when(cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)).thenReturn(Optional.of(openRegister));
        stubTotals();

        CashRegisterStatusResponse status = cashRegisterService.getStatus();

        assertTrue(status.open());
        assertEquals(new BigDecimal("130.00"), status.totalCashSales());
        assertEquals(new BigDecimal("210.00"), status.totalYapeSales());
        assertEquals(new BigDecimal("70.00"), status.totalPlinSales());
        assertEquals(new BigDecimal("0.00"), status.totalCardSales());
        assertEquals(new BigDecimal("230.00"), status.expectedCash());
    }

    @Test
    @DisplayName("Cerrar caja calcula el esperado en el servidor y registra la diferencia (RN10)")
    void close_computesExpectedAndDifference() {
        when(cashRegisterRepository.findByStatusForUpdate(CashRegisterStatus.OPEN)).thenReturn(Optional.of(openRegister));
        stubTotals();

        CloseCashRegisterResponse response = cashRegisterService.close(
                new CloseCashRegisterRequest(new BigDecimal("220.00"), "Faltó sencillo"));

        assertEquals(new BigDecimal("230.00"), response.expectedCash());
        assertEquals(new BigDecimal("220.00"), response.countedCash());
        assertEquals(new BigDecimal("-10.00"), response.difference());
        assertEquals(CashRegisterStatus.CLOSED, openRegister.getStatus());
        assertEquals(new BigDecimal("230.00"), openRegister.getExpectedCash());
        assertEquals(new BigDecimal("220.00"), openRegister.getCountedCash());
        assertSame(user, openRegister.getClosedBy());
        assertNotNull(openRegister.getClosedAt());
        assertEquals("Faltó sencillo", openRegister.getNotes());
    }

    @Test
    @DisplayName("Un sobrante se informa con diferencia positiva")
    void close_reportsSurplusAsPositiveDifference() {
        when(cashRegisterRepository.findByStatusForUpdate(CashRegisterStatus.OPEN)).thenReturn(Optional.of(openRegister));
        stubTotals();

        CloseCashRegisterResponse response = cashRegisterService.close(
                new CloseCashRegisterRequest(new BigDecimal("235.50"), null));

        assertEquals(new BigDecimal("5.50"), response.difference());
    }

    @Test
    @DisplayName("Un faltante mayor a S/ 5.00 exige justificación y el turno sigue abierto si no la hay")
    void close_rejects_whenShortageAboveThresholdHasNoNotes() {
        when(cashRegisterRepository.findByStatusForUpdate(CashRegisterStatus.OPEN)).thenReturn(Optional.of(openRegister));
        stubTotals();

        BusinessRuleException blank = assertThrows(BusinessRuleException.class,
                () -> cashRegisterService.close(new CloseCashRegisterRequest(new BigDecimal("224.00"), null)));
        BusinessRuleException whitespace = assertThrows(BusinessRuleException.class,
                () -> cashRegisterService.close(new CloseCashRegisterRequest(new BigDecimal("224.00"), "   ")));

        assertEquals("SHORTAGE_NOTES_REQUIRED", blank.getCode());
        assertEquals("SHORTAGE_NOTES_REQUIRED", whitespace.getCode());
        assertEquals(CashRegisterStatus.OPEN, openRegister.getStatus());
        verify(cashRegisterRepository, never()).save(any());
    }

    @Test
    @DisplayName("Un faltante de exactamente S/ 5.00 o un sobrante se cierran sin justificación")
    void close_allows_shortageAtThresholdAndSurplusWithoutNotes() {
        when(cashRegisterRepository.findByStatusForUpdate(CashRegisterStatus.OPEN)).thenReturn(Optional.of(openRegister));
        stubTotals();

        CloseCashRegisterResponse response = cashRegisterService.close(
                new CloseCashRegisterRequest(new BigDecimal("225.00"), null));

        assertEquals(new BigDecimal("-5.00"), response.difference());
        assertEquals(CashRegisterStatus.CLOSED, openRegister.getStatus());
    }

    @Test
    @DisplayName("No se puede cerrar una caja si no hay turno abierto")
    void close_rejects_whenNoOpenRegister() {
        when(cashRegisterRepository.findByStatusForUpdate(CashRegisterStatus.OPEN)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                () -> cashRegisterService.close(new CloseCashRegisterRequest(new BigDecimal("10.00"), null)));

        assertEquals("NO_OPEN_CASH_REGISTER", ex.getCode());
    }
}
