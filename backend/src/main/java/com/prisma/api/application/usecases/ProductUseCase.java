package com.prisma.api.application.usecases;

/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario
 *
 * Contrato de casos de uso para productos e inventario.
 * Mauricio implementará esta interfaz en la capa infrastructure/persistence.
 *
 * TODO Mauricio: Descomentar y completar los métodos según se implementen.
 * Usar los DTOs correspondientes (ver carpeta application/dto/).
 */
public interface ProductUseCase {

    // TODO Mauricio: List<ProductResponseDto> getAllProducts(String search, Long categoryId);
    // TODO Mauricio: ProductResponseDto getProductById(Long id);
    // TODO Mauricio: ProductResponseDto getProductBySku(String sku);
    // TODO Mauricio: ProductResponseDto getProductByBarcode(String barcode); // para scanner USB
    // TODO Mauricio: ProductResponseDto createProduct(ProductRequestDto request);
    // TODO Mauricio: ProductResponseDto updateProduct(Long id, ProductRequestDto request);
    // TODO Mauricio: void deleteProduct(Long id); // marca isActive = false
    // TODO Mauricio: List<ProductResponseDto> getLowStockProducts(); // para alertas Dashboard
}
