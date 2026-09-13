/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Hook de Lógica de Mostrador
 *
 * Administra el carrito de compras del ticket actual, el cálculo de subtotales,
 * validación de stock disponible y la búsqueda visual/por texto de productos.
 *
 * SOPORTE LECTOR CÓDIGO DE BARRAS (RF08):
 *  - Se usa @point-of-sale/keyboard-barcode-scanner en vez de un detector casero:
 *    separa de forma confiable el tecleo de un lector USB HID (keyboard wedge) del
 *    tecleo manual de un usuario, sin importar la marca/velocidad del lector.
 *
 * TODO Leo:
 *  - Probar con el lector físico USB en el mostrador (ver estado `scannerReady`).
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import KeyboardBarcodeScanner from '@point-of-sale/keyboard-barcode-scanner';

export const usePos = (catalog = []) => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [scannerReady, setScannerReady] = useState(false);
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  const addToCart = useCallback((product) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" está agotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Stock máximo: solo hay ${product.stock} unidades de "${product.name}".`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast.error(`Stock máximo alcanzado (${item.stock} unidades).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // RF08: Lectura de código de barras vía escáner USB en modo HID (keyboard wedge)
  useEffect(() => {
    const scanner = new KeyboardBarcodeScanner();

    const handleConnected = () => setScannerReady(true);
    const handleDisconnected = () => setScannerReady(false);

    const handleBarcode = (e) => {
      const scannedCode = e.value?.trim();
      if (!scannedCode) return;

      const found = catalogRef.current.find(
        (p) => p.barcode === scannedCode || p.sku.toLowerCase() === scannedCode.toLowerCase()
      );

      if (found) {
        addToCart(found);
      } else {
        toast.error(`Ningún producto coincide con el código "${scannedCode}".`);
      }
    };

    scanner.addEventListener('connected', handleConnected);
    scanner.addEventListener('disconnected', handleDisconnected);
    scanner.addEventListener('barcode', handleBarcode);
    scanner.connect();

    return () => {
      scanner.disconnect();
    };
  }, [addToCart]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    scannerReady,
  };
};
