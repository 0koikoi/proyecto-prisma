/**
 * RESPONSABLE: Leo
 * MÓDULO: POS & Caja — Navegación móvil (alcance: solo estas vistas)
 *
 * El Sidebar.jsx compartido (Keila/Zully) es de ancho fijo y no colapsa en
 * pantallas angostas, lo que deja muy poco espacio útil para POS/Caja en un
 * celular. Sin modificar Sidebar.jsx ni MainLayout.jsx (archivos compartidos),
 * este componente:
 *
 *  1. Inyecta una regla CSS con `<style>` que oculta `.sidebar` por debajo de
 *     1024px SOLO mientras este componente está montado — es decir, solo
 *     mientras el usuario está en /pos o /cash-register. Al salir de estas
 *     vistas, React desmonta el `<style>` y el sidebar vuelve a la normalidad
 *     en cualquier otra pantalla del sistema.
 *  2. Reutiliza el propio <Sidebar/> compartido dentro de un panel deslizante
 *     (drawer) para que la navegación y el diseño sigan siendo exactamente
 *     los mismos, solo que colapsables en móvil/tablet angosto.
 *
 * El botón disparador es `sticky` (no `fixed`): permanece siempre visible al
 * hacer scroll, justo debajo del Navbar compartido (que ya es sticky), sin
 * flotar por encima de otros controles como el botón "Cobrar Venta" (que es
 * de ancho completo y colisionaría con un botón `fixed`).
 *
 * IMPORTANTE: para que el `sticky` tenga recorrido en TODA la página, este
 * componente debe renderizarse como hijo directo del contenedor raíz de la
 * página (el que envuelve todo su contenido), NO anidado dentro de una fila
 * de encabezado pequeña — si no, solo "pegaría" durante el alto de esa fila.
 *
 * Uso: <MobileSidebarDrawer /> como primer hijo del contenedor raíz de
 * PosPage/CashRegisterPage.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '../../../shared/components/Sidebar';

export const MobileSidebarDrawer = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Cierra el panel automáticamente al navegar a otra sección
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Selector con combinador directo (>) para no ocultar la copia del sidebar dentro del drawer */}
      <style>{'@media (max-width: 1023px) { .layout-root > .sidebar { display: none; } }'}</style>

      <div className="lg:hidden sticky top-[76px] z-30 w-fit">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:border-gray-400 transition-colors cursor-pointer"
        >
          <Menu size={16} />
          <span>Menú</span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="mobile-nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="mobile-nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <Sidebar />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-6 -right-11 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-950 text-white border border-white/10 cursor-pointer"
                  title="Cerrar menú"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
