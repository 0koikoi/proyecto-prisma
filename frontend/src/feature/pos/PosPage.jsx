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
 *  4. Lectura de código de barras (lector USB modo HID) vía usePos/scannerReady
 *  5. Ticket virtual: lista de productos con control de cantidad y total
 *  6. Modal de pago: selector de método + cálculo de vuelto en efectivo
 *  7. Buscador rápido por teclado (Cmd/Ctrl+K) y atajos F2/F4/Esc (RNF02)
 *
 * CONEXIÓN CON BACKEND:
 *  - GET  /api/products?search=&categoryId= → catálogo del POS
 *  - POST /api/sales                        → procesar venta (@Transactional)
 *
 * TODO Leo: Reemplazar el mock de inventoryService por GET /api/products.
 * TODO Leo: Reemplazar el mock de posService.processSale() por POST /api/sales.
 */
import { useState } from 'react';
import { Search, ScanLine, Command as CommandIcon, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { playSound, isSoundEnabled, setSoundEnabled } from 'react-sounds';
import confetti from 'canvas-confetti';
import { usePos } from './hooks/usePos';
import { useInventory } from '../inventory/hooks/useInventory';
import { useCashRegister } from '../cash-register/hooks/useCashRegister';
import { ProductGrid } from './components/ProductGrid';
import { ProductGridSkeleton } from './components/ProductGridSkeleton';
import { CartTicket } from './components/CartTicket';
import { PaymentModal } from './components/PaymentModal';
import { TicketReceiptModal } from './components/TicketReceiptModal';
import { QuickSearchPalette } from './components/QuickSearchPalette';
import { posService } from './services/posService';
import { Input } from '../../shared/components/Input';

const SEARCH_INPUT_ID = 'pos-search-input';

export const PosPage = () => {
  const { allProducts, loading: productsLoading } = useInventory();
  const {
    cart, addToCart, updateQuantity, removeFromCart, clearCart,
    subtotal, discount, discountAmount, total, applyDiscount, clearDiscount,
    search, setSearch, selectedCategory, setSelectedCategory,
    scannerReady,
  } = usePos(allProducts);
  const { cashStatus, registerSale } = useCashRegister();
  // Mientras se resuelve el estado de caja (cashStatus === null) no bloqueamos
  // todavía, para no mostrar un aviso falso en el instante de carga.
  const isCashOpen = cashStatus === null || cashStatus.isOpen !== false;

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  const requestCheckout = () => {
    if (!isCashOpen) {
      toast.error('Debes abrir el turno de caja antes de registrar ventas.');
      playSound('notification/error', { volume: 0.4 });
      return;
    }
    setIsPaymentOpen(true);
  };

  // Atajos de teclado de mostrador (RNF02: la interacción debe sentirse inmediata)
  useHotkeys('mod+k', (e) => { e.preventDefault(); setIsQuickSearchOpen(true); });
  useHotkeys('f2', (e) => {
    e.preventDefault();
    document.getElementById(SEARCH_INPUT_ID)?.focus();
  });
  useHotkeys('f4', (e) => {
    e.preventDefault();
    if (cart.length > 0) requestCheckout();
  }, [cart.length, isCashOpen]);
  useHotkeys('esc', () => setIsPaymentOpen(false), { enabled: isPaymentOpen });

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
      discount,
      discountAmount,
      total,
      ...paymentData,
    };
    const res = await posService.processSale(payload);
    toast.success(`¡Venta registrada! Ticket #${res.ticketNumber}`);
    playSound('notification/success', { volume: 0.5 });
    // Confetti monocromático (blanco/negro/grises) para no romper el diseño minimalista
    confetti({
      particleCount: 70,
      spread: 65,
      startVelocity: 35,
      gravity: 1.1,
      origin: { y: 0.7 },
      colors: ['#0a0a0a', '#404040', '#737373', '#d4d4d4', '#ffffff'],
      disableForReducedMotion: true,
    });
    // Refleja la venta en los totales de Caja por método de pago (antes nunca se sincronizaba)
    registerSale({ paymentMethod: paymentData.paymentMethod, amount: total });
    // Se captura una copia del carrito antes de vaciarlo para el comprobante imprimible
    setReceipt({
      ticketNumber: res.ticketNumber,
      createdAt: res.createdAt,
      items: cart,
      subtotal,
      discount,
      discountAmount,
      total,
      paymentMethod: paymentData.paymentMethod,
      cashGiven: paymentData.cashGiven,
      vuelto: paymentData.vuelto,
    });
    clearCart();
  };

  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-130px)]">
      <Toaster position="top-center" theme="light" richColors />

      {/* Panel izquierdo: catálogo visual */}
      <div className="flex flex-col gap-4 flex-1 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 lg:overflow-hidden">
        {/* Aviso: no se puede cobrar sin un turno de caja abierto */}
        {!isCashOpen && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Caja cerrada — abre el turno para poder registrar ventas.</span>
          </div>
        )}

        {/* Búsqueda, estado del escáner y tabs de categoría */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex-1 min-w-[180px] relative">
              <Input
                name={SEARCH_INPUT_ID}
                placeholder="Buscar producto por nombre o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            {/* Buscador rápido por teclado (headless, cmdk) */}
            <button
              type="button"
              onClick={() => setIsQuickSearchOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 h-10 rounded-lg text-xs font-semibold whitespace-nowrap border border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Buscador rápido de productos"
            >
              <CommandIcon size={14} />
              <span>Buscar</span>
              <kbd className="text-[10px] font-bold text-gray-400 border border-gray-300 rounded px-1">⌘K</kbd>
            </button>
            {/* RF08: indicador discreto de lector de código de barras listo */}
            <div
              className={`flex items-center gap-1.5 px-3 h-10 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors ${
                scannerReady
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}
              title={scannerReady ? 'Lector de código de barras listo' : 'Lector de código de barras no detectado'}
            >
              <ScanLine size={14} />
              <span className={scannerReady ? 'inline w-1.5 h-1.5 rounded-full bg-emerald-500' : 'hidden'} />
              <span className="hidden sm:inline">{scannerReady ? 'Escáner listo' : 'Sin escáner'}</span>
            </div>
            {/* Silenciar sonidos de feedback (útil con clientes en mostrador) */}
            <button
              type="button"
              onClick={toggleSound}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
              title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
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
        {/* p-1: dejamos aire alrededor para que el borde/sombra de hover de la
            primera fila (whileHover y:-2 en ProductGrid) no se recorte contra
            el borde del contenedor con scroll. */}
        <div className="flex-1 overflow-y-auto p-1 -m-1">
          {productsLoading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={filteredProducts} onSelectProduct={addToCart} />
          )}
        </div>
      </div>

      {/* Panel derecho: ticket de venta */}
      <CartTicket
        cart={cart}
        subtotal={subtotal}
        discount={discount}
        discountAmount={discountAmount}
        total={total}
        onApplyDiscount={applyDiscount}
        onClearDiscount={clearDiscount}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={requestCheckout}
        cashRegisterOpen={isCashOpen}
      />
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        onConfirmSale={handleSaleSuccess}
      />

      <QuickSearchPalette
        open={isQuickSearchOpen}
        onOpenChange={setIsQuickSearchOpen}
        products={allProducts}
        onSelect={addToCart}
      />

      <TicketReceiptModal
        isOpen={!!receipt}
        onClose={() => setReceipt(null)}
        receipt={receipt}
      />
    </div>
  );
};
