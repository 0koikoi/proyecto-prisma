/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Hook de Estado de Caja
 *
 * Administra la carga del estado actual de la caja y las acciones de apertura/cierre.
 *
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { playSound } from 'react-sounds';
import { cashService } from '../services/cashService';

export const useCashRegister = () => {
  const [cashStatus, setCashStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await cashService.getStatus();
      setCashStatus(data);
    } catch (err) {
      console.error('Error fetching cash status:', err);
      toast.error('No se pudo cargar el estado de la caja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const openCash = async (initialAmount) => {
    try {
      await cashService.openRegister(initialAmount);
      await fetchStatus();
      toast.success(`Caja abierta con S/ ${initialAmount.toFixed(2)} de sencillo inicial.`);
      playSound('notification/success', { volume: 0.5 });
    } catch (err) {
      console.error('Error opening cash register:', err);
      toast.error('No se pudo abrir la caja.');
      playSound('notification/error', { volume: 0.4 });
    }
  };

  const closeCash = async (closeData) => {
    try {
      await cashService.closeRegister(closeData);
      await fetchStatus();
      const diff = closeData.difference ?? 0;
      if (diff === 0) {
        toast.success('Caja cerrada. Cuadre perfecto.');
        playSound('notification/success', { volume: 0.5 });
      } else if (diff < 0) {
        toast.warning(`Caja cerrada con faltante de S/ ${Math.abs(diff).toFixed(2)}.`);
        playSound('notification/warning', { volume: 0.4 });
      } else {
        toast.warning(`Caja cerrada con sobrante de S/ ${diff.toFixed(2)}.`);
        playSound('notification/warning', { volume: 0.4 });
      }
    } catch (err) {
      console.error('Error closing cash register:', err);
      toast.error('No se pudo cerrar la caja.');
      playSound('notification/error', { volume: 0.4 });
    }
  };

  // Suma una venta del POS al total del método de pago correspondiente y refresca
  // el estado — sin esto, Caja nunca se enteraba de lo vendido en el mostrador.
  const registerSale = async ({ paymentMethod, amount }) => {
    try {
      await cashService.registerSale({ paymentMethod, amount });
      await fetchStatus();
    } catch (err) {
      console.error('Error registering sale in cash register:', err);
    }
  };

  return {
    cashStatus,
    loading,
    reload: fetchStatus,
    openCash,
    closeCash,
    registerSale,
  };
};
