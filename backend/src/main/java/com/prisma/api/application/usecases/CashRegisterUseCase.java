package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Contrato de casos de uso para apertura y cierre de caja diaria.
 *
 * REGLA: Solo puede existir UNA caja con status="OPEN" a la vez.
 * El sistema debe validarlo antes de permitir una apertura.
 *
 * TODO Leo: Descomentar y completar los métodos según se implementen.
 */
public interface CashRegisterUseCase {

    // TODO Leo: CashRegisterResponseDto openCashRegister(CashRegisterOpenRequestDto request);
    // TODO Leo: CashRegisterResponseDto closeCashRegister(Long cashRegisterId, CashRegisterCloseRequestDto request);
    // TODO Leo: CashRegisterResponseDto getActiveCashRegister(); // retorna la caja abierta
    // TODO Leo: CashRegisterResponseDto getCashRegisterById(Long id);
}
