package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Venta (POS)
 *
 * Contrato de casos de uso para ventas presenciales en el mostrador.
 *
 * REGLA CRÍTICA: el método processSale() debe ser @Transactional.
 * Si falla cualquier paso (ej: producto sin stock), debe revertirse todo:
 *   1. Validar que todos los productos tengan stock suficiente.
 *   2. Crear el Sale y los SaleDetail.
 *   3. Descontar el stock de cada Product.
 *   4. Actualizar los totales de CashRegister según el paymentMethod.
 *   5. Crear un InventoryMovement tipo SALIDA_VENTA_POS por cada producto.
 *   6. Crear un FinancialTransaction tipo INGRESO / VENTA_POS.
 *
 * TODO Leo: Descomentar y completar los métodos según se implementen.
 */
public interface SaleUseCase {

    // TODO Leo: SaleResponseDto processSale(SaleRequestDto request); // @Transactional
    // TODO Leo: List<SaleResponseDto> getSalesByCashRegister(Long cashRegisterId);
    // TODO Leo: List<SaleResponseDto> getSalesByDateRange(LocalDate from, LocalDate to);
}
