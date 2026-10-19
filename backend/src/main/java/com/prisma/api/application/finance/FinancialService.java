package com.prisma.api.application.finance;

import com.prisma.api.application.finance.dto.CreateFinancialTransactionRequest;
import com.prisma.api.application.finance.dto.FinancialSummaryResponse;
import com.prisma.api.application.finance.dto.FinancialTransactionResponse;
import com.prisma.api.application.finance.dto.PeriodDto;
import com.prisma.api.application.finance.mapper.FinancialTransactionMapper;
import com.prisma.api.application.port.CurrentUserProvider;
import com.prisma.api.domain.entities.CashRegister;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.entities.User;
import com.prisma.api.domain.enums.CashRegisterStatus;
import com.prisma.api.domain.enums.FinancialTransactionStatus;
import com.prisma.api.domain.enums.FinancialTransactionType;
import com.prisma.api.domain.enums.PaymentMethod;
import com.prisma.api.domain.exceptions.BusinessRuleException;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FinancialService {

    private final FinancialTransactionRepository financialTransactionRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final CurrentUserProvider currentUserProvider;

    public FinancialService(
            FinancialTransactionRepository financialTransactionRepository,
            CashRegisterRepository cashRegisterRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.financialTransactionRepository = financialTransactionRepository;
        this.cashRegisterRepository = cashRegisterRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public FinancialSummaryResponse getFinancialSummary(String startDateStr, String endDateStr) {
        LocalDate startLocalDate = parseDateOrDefault(startDateStr, LocalDate.now().withDayOfMonth(1));
        LocalDate endLocalDate = parseDateOrDefault(endDateStr, LocalDate.now());

        if (endLocalDate.isBefore(startLocalDate)) {
            endLocalDate = startLocalDate;
        }

        Instant fromInstant = startLocalDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = endLocalDate.atTime(23, 59, 59, 999_000_000).toInstant(ZoneOffset.UTC);

        List<FinancialTransaction> allTransactions = financialTransactionRepository.findBetweenDates(fromInstant, toInstant);

        BigDecimal totalPhysicalSales = BigDecimal.ZERO;
        BigDecimal totalOnlineSales = BigDecimal.ZERO;
        BigDecimal otherInflows = BigDecimal.ZERO;
        BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;

        for (FinancialTransaction tx : allTransactions) {
            // Solo registros verificados afectan las métricas contables
            if (tx.getStatus() != FinancialTransactionStatus.VERIFIED) {
                continue;
            }

            if (tx.getTransactionType() == FinancialTransactionType.IN) {
                if (tx.getSale() != null) {
                    totalPhysicalSales = totalPhysicalSales.add(tx.getAmount());
                } else if (tx.getOrder() != null) {
                    totalOnlineSales = totalOnlineSales.add(tx.getAmount());
                } else {
                    otherInflows = otherInflows.add(tx.getAmount());
                }
            } else if (tx.getTransactionType() == FinancialTransactionType.OUT) {
                if (tx.getPurchase() != null) {
                    totalCostOfGoodsSold = totalCostOfGoodsSold.add(tx.getAmount());
                }
            }
        }

        BigDecimal totalRevenue = totalPhysicalSales.add(totalOnlineSales).add(otherInflows)
                .setScale(2, RoundingMode.HALF_UP);
        totalPhysicalSales = totalPhysicalSales.setScale(2, RoundingMode.HALF_UP);
        totalOnlineSales = totalOnlineSales.setScale(2, RoundingMode.HALF_UP);
        totalCostOfGoodsSold = totalCostOfGoodsSold.setScale(2, RoundingMode.HALF_UP);

        BigDecimal grossProfit = totalRevenue.subtract(totalCostOfGoodsSold)
                .setScale(2, RoundingMode.HALF_UP);

        double netMarginPercentage = 0.0;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            netMarginPercentage = grossProfit
                    .divide(totalRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        List<FinancialTransactionResponse> transactionResponses = allTransactions.stream()
                .map(FinancialTransactionMapper::toResponse)
                .toList();

        PeriodDto period = new PeriodDto(startLocalDate.toString(), endLocalDate.toString());

        return new FinancialSummaryResponse(
                period,
                totalPhysicalSales,
                totalOnlineSales,
                totalRevenue,
                totalCostOfGoodsSold,
                grossProfit,
                netMarginPercentage,
                transactionResponses
        );
    }

    public List<FinancialTransactionResponse> getTransactions(String type, String startDate, String endDate) {
        LocalDate startLocalDate = parseDateOrDefault(startDate, LocalDate.now().minusDays(30));
        LocalDate endLocalDate = parseDateOrDefault(endDate, LocalDate.now());

        Instant from = startLocalDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = endLocalDate.atTime(23, 59, 59, 999_000_000).toInstant(ZoneOffset.UTC);

        List<FinancialTransaction> list = financialTransactionRepository.findBetweenDates(from, to);

        return list.stream()
                .filter(tx -> {
                    if (type == null || type.isBlank() || "TODAS".equalsIgnoreCase(type)) {
                        return true;
                    }
                    if ("INGRESO".equalsIgnoreCase(type)) {
                        return tx.getTransactionType() == FinancialTransactionType.IN;
                    }
                    if ("EGRESO".equalsIgnoreCase(type)) {
                        return tx.getTransactionType() == FinancialTransactionType.OUT;
                    }
                    return true;
                })
                .map(FinancialTransactionMapper::toResponse)
                .toList();
    }

    @Transactional
    public FinancialTransactionResponse recordManualTransaction(CreateFinancialTransactionRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        FinancialTransactionType type;
        try {
            type = FinancialTransactionType.valueOf(request.transactionType().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_TYPE", "El tipo de transacción debe ser IN o OUT");
        }

        PaymentMethod method;
        try {
            String m = request.paymentMethod().trim().toUpperCase();
            if ("TRANSFERENCIA".equals(m)) {
                method = PaymentMethod.TARJETA;
            } else {
                method = PaymentMethod.valueOf(m);
            }
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_PAYMENT_METHOD", "Medio de pago no autorizado");
        }

        CashRegister register = null;
        if (request.cashRegisterId() != null) {
            register = cashRegisterRepository.findById(request.cashRegisterId())
                    .orElseThrow(() -> new BusinessRuleException("CASH_REGISTER_NOT_FOUND", "Turno de caja no encontrado"));
        } else if (method == PaymentMethod.EFECTIVO) {
            register = cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)
                    .orElse(null);
        }

        FinancialTransaction tx = new FinancialTransaction();
        tx.setRequestKey(UUID.randomUUID());
        tx.setRecordedBy(currentUser);
        tx.setVerifiedBy(currentUser);
        tx.setTransactionType(type);
        tx.setAmount(request.amount().setScale(2, RoundingMode.HALF_UP));
        tx.setPaymentMethod(method);
        tx.setStatus(FinancialTransactionStatus.VERIFIED);
        tx.setCreatedAt(Instant.now());
        tx.setVerifiedAt(Instant.now());
        tx.setCashRegister(register);
        tx.setExternalReference(request.externalReference());
        tx.setDescription(request.description() != null ? request.description().trim() : "Transacción manual");

        FinancialTransaction saved = financialTransactionRepository.save(tx);
        return FinancialTransactionMapper.toResponse(saved);
    }

    private LocalDate parseDateOrDefault(String dateStr, LocalDate defaultDate) {
        if (dateStr == null || dateStr.isBlank()) {
            return defaultDate;
        }
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (DateTimeParseException e) {
            return defaultDate;
        }
    }
}
