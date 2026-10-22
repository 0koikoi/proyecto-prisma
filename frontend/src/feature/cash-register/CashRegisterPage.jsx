/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario
 *
 * Página de apertura y cierre de caja del turno actual.
 *
 * SECCIONES A IMPLEMENTAR:
 *  1. Tarjetas de estado de caja (sencillo inicial, ventas por método de pago)
 *  2. Botón "Abrir Caja" (si no hay caja activa) → modal de apertura
 *  3. Botón "Cerrar Caja" (si hay caja activa) → modal de arqueo con cálculo de diferencia
 *  4. Detalle de ventas del turno por método de pago (Efectivo / Yape / Plin / Tarjeta)
 *
 * CONEXIÓN CON BACKEND (ver cashService):
 *  - GET  /api/cash-register/status → estado del turno y totales por método de pago
 *  - POST /api/cash-register/open    → abrir caja con sencillo inicial (solo una caja abierta a la vez)
 *  - POST /api/cash-register/close   → cerrar caja con el conteo físico
 *
 * El efectivo esperado (sencillo inicial + efectivo neto cobrado) y la diferencia
 * (sobrante o faltante) los calcula el servidor; la pantalla solo los muestra.
 *
 * Atajos de teclado: F2 abre el turno, F4 lo cierra, Esc cierra el modal activo.
 */
import { useState } from 'react';
import { Toaster } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { Lock, Unlock, DollarSign, Smartphone, CreditCard, Receipt } from 'lucide-react';
import { useCashRegister } from './hooks/useCashRegister';
import { useShiftSales } from './hooks/useShiftSales';
import { TicketReceiptModal } from '../pos/components/TicketReceiptModal';
import { CashOpenModal } from './components/CashOpenModal';
import { CashCloseModal } from './components/CashCloseModal';
import { CashRegisterSkeleton } from './components/CashRegisterSkeleton';
import { Button } from '../../shared/components/Button';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', YAPE: 'Yape', PLIN: 'Plin', TARJETA: 'Tarjeta' };

export const CashRegisterPage = () => {
  const { cashStatus, loading, reload, openCash, closeCash } = useCashRegister();
  // Mientras carga (cashStatus null) no se asume ningún estado.
  const isShiftOpen = cashStatus?.isOpen !== false;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCloseModal, setIsCloseModal] = useState(false);
  const [reprintSale, setReprintSale] = useState(null);
  const { sales: shiftSales, loading: salesLoading } = useShiftSales(cashStatus?.isOpen === true);

  useHotkeys('f2', (e) => { e.preventDefault(); if (!isShiftOpen) setIsOpenModal(true); }, [isShiftOpen]);
  useHotkeys('f4', (e) => { e.preventDefault(); if (isShiftOpen) setIsCloseModal(true); }, [isShiftOpen]);
  useHotkeys('esc', () => { setIsOpenModal(false); setIsCloseModal(false); }, { enabled: isOpenModal || isCloseModal });

  if (loading && !cashStatus) return <CashRegisterSkeleton />;

  if (!cashStatus) {
    return (
      <div className="page-container">
        <Toaster position="top-center" theme="light" richColors />
        <div className="content-card flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-gray-900 font-bold text-base">No se pudo cargar el estado de la caja</p>
          <p className="text-gray-500 text-sm max-w-md">
            Verifica que el backend de Spring Boot esté iniciado en http://localhost:8080 y conectado a la base de datos.
          </p>
          <Button variant="primary" onClick={reload}>
            Reintentar conexión
          </Button>
        </div>
      </div>
    );
  }

  const totalIngresos =
    cashStatus.totalCashSales +
    cashStatus.totalYapeSales +
    cashStatus.totalPlinSales +
    cashStatus.totalCardSales;

  const efectivoEsperado = cashStatus.expectedCash ?? cashStatus.initialCash + cashStatus.totalCashSales;

  return (
    <div className="page-container">
      <Toaster position="top-center" theme="light" richColors />

      {/* Encabezado — pasa a fila recién en `lg`: en anchos intermedios (tablet)
          "Cerrar Turno"/"Abrir Turno" no cabían junto al título y se envolvían
          en dos líneas desparejas; ahora se quedan en su propia fila de 2
          columnas parejas hasta que realmente sobra espacio para ir al lado
          del título. */}
      <div className="page-header flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="flex items-center justify-between gap-3 lg:block">
          <div>
            <h1>Caja y Arqueo Diario</h1>
            <p className="text-sm text-gray-500 mt-0.5">Control de turno, sencillo inicial y cuadre de caja diario.</p>
          </div>
          <span className="hidden xl:inline text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
            F2 abrir · F4 cerrar
          </span>
        </div>
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 shrink-0">
          <Button variant="secondary" icon={Lock} onClick={() => setIsCloseModal(true)} disabled={!isShiftOpen} className="w-full lg:w-auto">
            Cerrar Turno
          </Button>
          <Button variant="primary" icon={Unlock} onClick={() => setIsOpenModal(true)} disabled={isShiftOpen} className="w-full lg:w-auto">
            Abrir Turno
          </Button>
        </div>
      </div>

      {/* Estado del turno */}
      {isShiftOpen ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Caja del Turno: ABIERTA</p>
              <p className="text-xs text-emerald-700">Abierta por {cashStatus.openedBy ?? 'Personal'} a las {formatDate(cashStatus.openedAt)}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Sencillo Inicial</p>
            <p className="text-xl font-bold text-emerald-900">{formatCurrency(cashStatus.initialCash)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-gray-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-800">Caja del Turno: CERRADA</p>
            <p className="text-xs text-gray-500">Abre un turno con el sencillo inicial para poder registrar ventas.</p>
          </div>
        </div>
      )}

      {/* Tarjetas de ventas por método de pago */}
      <div>
        <h3 className="mb-3 text-gray-700 font-semibold">Ventas del Turno por Método de Pago</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CashMetric label="Efectivo en gaveta" value={formatCurrency(cashStatus.totalCashSales)} sub="Cobros en físico" icon={DollarSign} />
          <CashMetric label="Yape" value={formatCurrency(cashStatus.totalYapeSales)} sub="Billetera digital" icon={Smartphone} />
          <CashMetric label="Plin" value={formatCurrency(cashStatus.totalPlinSales)} sub="Billetera digital" icon={Smartphone} />
          <CashMetric label="Tarjetas" value={formatCurrency(cashStatus.totalCardSales)} sub="Débito / Crédito" icon={CreditCard} />
        </div>
      </div>

      {/* Resumen del arqueo */}
      <div className="content-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Ventas Registradas</p>
            <p className="text-2xl font-black text-gray-950">{formatCurrency(totalIngresos)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase">Efectivo Físico Esperado</p>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(efectivoEsperado)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          * El efectivo esperado es la suma del sencillo inicial ({formatCurrency(cashStatus.initialCash)}) más las ventas en efectivo ({formatCurrency(cashStatus.totalCashSales)}).
        </p>
      </div>

      {/* Ventas del turno: consulta y reimpresión de ticket */}
      {isShiftOpen && (
        <div className="content-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Ventas del Turno</h3>
            <span className="text-xs text-gray-400">
              {shiftSales.length} {shiftSales.length === 1 ? 'venta' : 'ventas'}
            </span>
          </div>
          {salesLoading ? (
            <p className="text-sm text-gray-400">Cargando ventas...</p>
          ) : shiftSales.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no hay ventas en este turno.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {shiftSales.map((sale) => (
                <li key={sale.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">#{sale.ticketNumber}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(sale.createdAt)} · {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(sale.total)}</span>
                    <Button variant="secondary" size="sm" icon={Receipt} onClick={() => setReprintSale(sale)}>
                      Ver ticket
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modales */}
      <CashOpenModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onConfirm={async (amt) => {
          await openCash(amt);
          setIsOpenModal(false);
        }}
      />

      <TicketReceiptModal
        isOpen={!!reprintSale}
        onClose={() => setReprintSale(null)}
        receipt={reprintSale}
        title="Reimpresión de ticket"
      />

      <CashCloseModal
        isOpen={isCloseModal}
        onClose={() => setIsCloseModal(false)}
        expectedTotal={efectivoEsperado}
        onConfirm={async (res) => {
          await closeCash(res);
          setIsCloseModal(false);
        }}
      />
    </div>
  );
};

const CashMetric = ({ label, value, sub, icon: Icon }) => (
  <div className="content-card flex items-start gap-3">
    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
      <Icon size={20} className="text-gray-600" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  </div>
);
