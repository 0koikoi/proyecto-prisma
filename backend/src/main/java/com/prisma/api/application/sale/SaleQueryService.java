package com.prisma.api.application.sale;

import com.prisma.api.application.sale.dto.SaleResponse;
import com.prisma.api.application.sale.mapper.SaleMapper;
import com.prisma.api.domain.entities.FinancialTransaction;
import com.prisma.api.domain.entities.Sale;
import com.prisma.api.domain.entities.SaleDetail;
import com.prisma.api.domain.enums.CashRegisterStatus;
import com.prisma.api.domain.exceptions.ResourceNotFoundException;
import com.prisma.api.infrastructure.persistence.CashRegisterRepository;
import com.prisma.api.infrastructure.persistence.FinancialTransactionRepository;
import com.prisma.api.infrastructure.persistence.SaleDetailRepository;
import com.prisma.api.infrastructure.persistence.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Consulta de ventas de mostrador: lista del turno abierto y detalle por id (para reimprimir el ticket). */
@Service
public class SaleQueryService {

    private final SaleRepository saleRepository;
    private final SaleDetailRepository saleDetailRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final FinancialTransactionRepository financialTransactionRepository;

    public SaleQueryService(SaleRepository saleRepository,
                            SaleDetailRepository saleDetailRepository,
                            CashRegisterRepository cashRegisterRepository,
                            FinancialTransactionRepository financialTransactionRepository) {
        this.saleRepository = saleRepository;
        this.saleDetailRepository = saleDetailRepository;
        this.cashRegisterRepository = cashRegisterRepository;
        this.financialTransactionRepository = financialTransactionRepository;
    }

    /** Ventas del turno abierto, de la más reciente a la más antigua; vacía si no hay turno abierto. */
    @Transactional(readOnly = true)
    public List<SaleResponse> listCurrentShift() {
        return cashRegisterRepository.findFirstByStatus(CashRegisterStatus.OPEN)
                .map(register -> toResponses(saleRepository.findByCashRegisterIdOrderByIdDesc(register.getId())))
                .orElseGet(List::of);
    }

    @Transactional(readOnly = true)
    public SaleResponse getById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id));
        return SaleMapper.toResponse(
                sale,
                saleDetailRepository.findBySaleIdOrderByIdAsc(sale.getId()),
                SaleMapper.primaryPayment(sale, financialTransactionRepository.findBySaleId(sale.getId())));
    }

    private List<SaleResponse> toResponses(List<Sale> sales) {
        if (sales.isEmpty()) {
            return List.of();
        }
        List<Long> ids = sales.stream().map(Sale::getId).toList();
        Map<Long, List<SaleDetail>> detailsBySale = saleDetailRepository.findAllBySaleIds(ids).stream()
                .collect(Collectors.groupingBy(detail -> detail.getSale().getId()));
        Map<Long, List<FinancialTransaction>> paymentsBySale = financialTransactionRepository.findBySaleIdIn(ids).stream()
                .collect(Collectors.groupingBy(tx -> tx.getSale().getId()));

        return sales.stream()
                .map(sale -> SaleMapper.toResponse(
                        sale,
                        detailsBySale.getOrDefault(sale.getId(), List.of()),
                        SaleMapper.primaryPayment(sale, paymentsBySale.getOrDefault(sale.getId(), List.of()))))
                .toList();
    }
}
