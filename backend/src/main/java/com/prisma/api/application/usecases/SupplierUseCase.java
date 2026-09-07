package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Zully
 * MÓDULO: Proveedores
 *
 * Contrato de casos de uso para gestión de proveedores y reposiciones de stock.
 *
 * TODO Zully: Descomentar y completar los métodos según se implementen.
 */
public interface SupplierUseCase {

    // TODO Zully: List<SupplierResponseDto> getAllSuppliers();
    // TODO Zully: SupplierResponseDto getSupplierById(Long id);
    // TODO Zully: SupplierResponseDto createSupplier(SupplierRequestDto request);
    // TODO Zully: SupplierResponseDto updateSupplier(Long id, SupplierRequestDto request);
    // TODO Zully: void deleteSupplier(Long id);

    // REPOSICIONES (historial de compras a proveedor):
    // TODO Zully: PurchaseResponseDto registerRestock(Long supplierId, PurchaseRequestDto request);
    //   → Este método debe coordinar con Mauricio (Inventario): al ejecutarse,
    //     incrementa el stock de cada producto y registra los InventoryMovements.
    // TODO Zully: List<PurchaseResponseDto> getRestockHistory(Long supplierId);
}
