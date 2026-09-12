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
 * CONEXIÓN CON BACKEND:
 *  - GET  /api/cash-register/active  → obtener caja abierta actualmente
 *  - POST /api/cash-register/open    → abrir caja con sencillo inicial
 *  - POST /api/cash-register/{id}/close → cerrar caja con conteo físico
 *
 * TODO Leo: Conectar con GET /api/cash-register/active al cargar la página.
 * TODO Leo: Solo puede haber UNA caja abierta — validar en el backend.
 * TODO Leo: El cierre de caja calcula expectedCash = initialCash + totalCashSales.
 *           El sistema muestra la diferencia (sobrante o faltante).
 *
 * Atajos de teclado: F2 abre el turno, F4 lo cierra, Esc cierra el modal activo.
 */
import { useState } from 'react';
import { Toaster } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { Lock, Unlock, DollarSign, Smartphone, CreditCard } from 'lucide-react';
import { useCashRegister } from './hooks/useCashRegister';
import { CashOpenModal } from './components/CashOpenModal';
import { CashCloseModal } from './components/CashCloseModal';
import { Button } from '../../shared/components/Button';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';

export const CashRegisterPage = () => {
  const { cashStatus, openCash, closeCash } = useCashRegister();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCloseModal, setIsCloseModal] = useState(false);

  useHotkeys('f2', (e) => { e.preventDefault(); setIsOpenModal(true); });
  useHotkeys('f4', (e) => { e.preventDefault(); setIsCloseModal(true); });
  useHotkeys('esc', () => { setIsOpenModal(false); setIsCloseModal(false); }, { enabled: isOpenModal || isCloseModal });

  if (!cashStatus) return null;

  const totalIngresos =
    cashStatus.totalCashSales +
    cashStatus.totalYapeSales +
    cashStatus.totalPlinSales +
    cashStatus.totalCardSales;

  const efectivoEsperado = cashStatus.initialCash + cashStatus.totalCashSales;

  return (
    <div className="page-container">
      <Toaster position="top-center" theme="light" richColors />

      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1>Caja y Arqueo Diario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control de turno, sencillo inicial y cuadre de caja diario.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
            F2 abrir · F4 cerrar
          </span>
          <Button variant="secondary" icon={Lock} onClick={() => setIsCloseModal(true)}>
            Cerrar Turno
          </Button>
          <Button variant="primary" icon={Unlock} onClick={() => setIsOpenModal(true)}>
            Abrir Turno
          </Button>
        </div>
      </div>

      {/* Estado del turno */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Caja del Turno: ABIERTA</p>
            <p className="text-xs text-emerald-700">Abierta por {cashStatus.openedBy ?? 'Personal'} a las {formatDate(cashStatus.openedAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Sencillo Inicial</p>
          <p className="text-xl font-bold text-emerald-900">{formatCurrency(cashStatus.initialCash)}</p>
        </div>
      </div>

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
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Ventas Registradas</p>
            <p className="text-2xl font-black text-gray-950">{formatCurrency(totalIngresos)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase">Efectivo Físico Esperado</p>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(efectivoEsperado)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          * El efectivo esperado es la suma del sencillo inicial ({formatCurrency(cashStatus.initialCash)}) más las ventas en efectivo ({formatCurrency(cashStatus.totalCashSales)}).
        </p>
      </div>

      {/* Modales */}
      <CashOpenModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onConfirm={async (amt) => {
          await openCash(amt);
          setIsOpenModal(false);
        }}
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
