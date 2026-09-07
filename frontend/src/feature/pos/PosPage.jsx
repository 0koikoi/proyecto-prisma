/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS)
 *
 * Página principal del POS — pantalla de cobro rápido en mostrador.
 *
 * DISEÑO: Split horizontal (catálogo izquierda / ticket derecha).
 *
 * FUNCIONALIDADES A IMPLEMENTAR:
 *  1. Buscador de texto: filtra por nombre y SKU en tiempo real
 *  2. Tabs de categorías: Todos | Femenina | Urbana | Mascotas
 *  3. Cuadrícula de productos: tarjetas táctiles (clic agrega al ticket)
 *  4. Campo de captura de código de barras (opcional — lector USB modo HID):
 *     El campo debe estar siempre enfocado y detectar el patrón de escaneo
 *     (secuencia rápida de caracteres + Enter) para diferenciarlo del tipeo manual.
 *  5. Ticket virtual: lista de productos con control de cantidad y total
 *  6. Modal de pago: selector de método + cálculo de vuelto en efectivo
 *
 * CONEXIÓN CON BACKEND:
 *  - GET  /api/products?search=&categoryId= → catálogo del POS
 *  - POST /api/sales                        → procesar venta (@Transactional)
 *
 * TODO Leo: El campo de barcode puede ser un <input type="text" ref={barcodeRef}> siempre
 *           enfocado que llama a addToCart(product) cuando detecta Enter.
 *           Ver RF08 del plan prisma.md para el comportamiento esperado.
 * TODO Leo: Reemplazar el mock de inventoryService por GET /api/products.
 * TODO Leo: Reemplazar el mock de posService.processSale() por POST /api/sales.
 * TODO Leo: Validar que el botón "Cobrar" esté deshabilitado si no hay caja abierta.
 */
import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePos } from './hooks/usePos';
import { useInventory } from '../inventory/hooks/useInventory';
import { ProductGrid } from './components/ProductGrid';
import { CartTicket } from './components/CartTicket';
import { PaymentModal } from './components/PaymentModal';
import { posService } from './services/posService';
import { Input } from '../../shared/components/Input';

export const PosPage = () => {
  const { allProducts } = useInventory();
  const {
    cart, addToCart, updateQuantity, removeFromCart, clearCart,
    subtotal, search, setSearch, selectedCategory, setSelectedCategory,
  } = usePos(allProducts);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const categories = ['ALL', 'Femenina', 'Urbana', 'Mascotas'];

  const filteredProducts = allProducts.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q));
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaleSuccess = async (paymentData) => {
    const payload = {
      items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
      subtotal,
      ...paymentData,
    };
    const res = await posService.processSale(payload);
    alert(`¡Venta registrada! Ticket #${res.ticketNumber}`);
    clearCart();
  };

  return (
    <div className="flex gap-5" style={{ height: 'calc(100vh - 130px)' }}>

      {/* Panel izquierdo: catálogo visual */}
      <div className="flex flex-col gap-4 flex-1 bg-white border border-gray-200 rounded-xl p-5 overflow-hidden">
        {/* Búsqueda y tabs de categoría */}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Buscar producto por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
          {/* TODO Leo: agregar aquí el input oculto de captura de código de barras (RF08) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors
                  ${selectedCategory === cat
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
              >
                {cat === 'ALL' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cuadrícula de productos */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid products={filteredProducts} onSelectProduct={addToCart} />
        </div>
      </div>

      {/* Panel derecho: ticket de venta */}
      <CartTicket
        cart={cart}
        subtotal={subtotal}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={() => setIsPaymentOpen(true)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={subtotal}
        onConfirmSale={handleSaleSuccess}
      />
    </div>
  );
};
