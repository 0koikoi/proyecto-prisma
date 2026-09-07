/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Hook de Lógica de Mostrador
 *
 * Administra el carrito de compras del ticket actual, el cálculo de subtotales,
 * validación de stock disponible y la búsqueda visual/por texto de productos.
 *
 * SOPORTE LECTOR CÓDIGO DE BARRAS (RF08):
 *  - Los escáneres USB funcionan en modo HID (Keyboard Wedge), emitiendo caracteres
 *    a gran velocidad seguidos de 'Enter'.
 *  - Este hook incluye el detector para agregar automáticamente el producto al ticket.
 *
 * TODO Leo:
 *  - Probar con el lector físico USB en el mostrador para ajustar el umbral de detección (50ms).
 */
import { useState, useEffect, useCallback } from 'react';

export const usePos = (catalog = []) => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const addToCart = useCallback((product) => {
    if (product.stock <= 0) {
      alert(`El producto "${product.name}" está agotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`No puedes agregar más: solo hay ${product.stock} unidades en stock.`);
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
              alert(`Stock máximo alcanzado (${item.stock} unidades)`);
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

  // RF08: Detección de escáner de código de barras USB (tecleo rápido + Enter)
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo intencionalmente en un input o textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Si el intervalo entre teclas es mayor a 80ms, no es un escáner: reiniciar buffer
      if (timeDiff > 80) {
        barcodeBuffer = '';
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 4) {
          const scannedCode = barcodeBuffer.trim();
          console.log('[Scanner USB detectado]:', scannedCode);

          // Buscar el producto en el catálogo en memoria
          const found = catalog.find(
            (p) => p.barcode === scannedCode || p.sku.toLowerCase() === scannedCode.toLowerCase()
          );

          if (found) {
            addToCart(found);
          } else {
            console.warn('Producto no encontrado con el código escaneado:', scannedCode);
          }
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [catalog, addToCart]);

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
  };
};
