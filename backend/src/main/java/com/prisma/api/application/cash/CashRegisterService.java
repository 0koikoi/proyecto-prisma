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
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;

/**
 * Turno de caja único (RN08): apertura, estado con totales por método de pago y cierre con arqueo.
 * El efectivo esperado siempre se calcula aquí a partir de los cobros verificados (RN09), nunca lo envía el cliente.
 */
@Service
public class CashRegisterService {

    /** Un faltante por encima de este monto (S/) exige notas que lo justifiquen. */
    private static final BigDecimal SHORTAGE_NOTES_THRESHOLD = new BigDecimal("5.00");

    private final CashRegisterRepository cashRegisterRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final CurrentUserProvider currentUserProvider;

    public CashRegisterService(CashRegisterRepository cashRegisterRepository,
                               FinancialTransactionRepository financialTransactionRepository,
                               CurrentUserProvider currentUserProvider) {
        this.cashRegisterRepository = cashRegisterRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public CashRegisterStatusResponse getStatus() {
        return cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)
                .map(register -> CashRegisterMapper.toStatus(register, totalsOf(register.getId())))
                .orElseGet(CashRegisterMapper::closedStatus);
    }

    @Transactional
    public CashRegisterStatusResponse open(OpenCashRegisterRequest request) {
        if (cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN).isPresent()) {
            throw alreadyOpen();
        }
        CashRegister register = new CashRegister(
                currentUserProvider.getCurrentUser(),
                request.initialCash().setScale(2, RoundingMode.HALF_UP));
        try {
            register = cashRegisterRepository.saveAndFlush(register);
        } catch (DataIntegrityViolationException ex) {
            // Dos aperturas simultáneas: el índice único uq_cash_registers_single_open deja pasar solo una.
            throw alreadyOpen();
        }
        return CashRegisterMapper.toStatus(register, totalsOf(register.getId()));
    }

    @Transactional
    public CloseCashRegisterResponse close(CloseCashRegisterRequest request) {
        CashRegister register = cashRegisterRepository.findByStatusForUpdate(CashRegisterStatus.OPEN)
                .orElseThrow(() -> new BusinessRuleException(
                        "NO_OPEN_CASH_REGISTER", "No hay un turno de caja abierto para cerrar"));
        User user = currentUserProvider.getCurrentUser();

        BigDecimal expected = register.getInitialCash().setScale(2, RoundingMode.HALF_UP)
                .add(totalsOf(register.getId()).cash());
        BigDecimal counted = request.countedCash().setScale(2, RoundingMode.HALF_UP);
        BigDecimal difference = counted.subtract(expected);
        String notes = blankToNull(request.notes());
        if (difference.negate().compareTo(SHORTAGE_NOTES_THRESHOLD) > 0 && notes == null) {
            throw new BusinessRuleException("SHORTAGE_NOTES_REQUIRED",
                    "Debes justificar un faltante mayor a S/ " + SHORTAGE_NOTES_THRESHOLD);
        }
        Instant now = Instant.now();

        register.setExpectedCash(expected);
        register.setCountedCash(counted);
        register.setClosedBy(user);
        register.setClosedAt(now);
        register.setStatus(CashRegisterStatus.CLOSED);
        register.setNotes(notes);
        cashRegisterRepository.save(register);

        return new CloseCashRegisterResponse(register.getId(), expected, counted, difference, now);
    }

    private CashTotals totalsOf(Long registerId) {
        Map<PaymentMethod, BigDecimal> net = new EnumMap<>(PaymentMethod.class);
        for (FinancialTransactionRepository.MethodTotal row : financialTransactionRepository
                .totalsByRegister(registerId, FinancialTransactionStatus.VERIFIED)) {
            BigDecimal signed = row.getTransactionType() == FinancialTransactionType.IN
                    ? row.getTotal()
                    : row.getTotal().negate();
            net.merge(row.getPaymentMethod(), signed, BigDecimal::add);
        }
        return new CashTotals(
                scaled(net.get(PaymentMethod.EFECTIVO)),
                scaled(net.get(PaymentMethod.YAPE)),
                scaled(net.get(PaymentMethod.PLIN)),
                scaled(net.get(PaymentMethod.TARJETA)));
    }

    private static BigDecimal scaled(BigDecimal value) {
        return value == null ? CashTotals.ZERO.cash() : value.setScale(2, RoundingMode.HALF_UP);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static BusinessRuleException alreadyOpen() {
        return new BusinessRuleException("CASH_ALREADY_OPEN", "Ya hay un turno de caja abierto");
    }
}
