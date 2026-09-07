/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Hook de Estado de Caja
 *
 * Administra la carga del estado actual de la caja y las acciones de apertura/cierre.
 *
 * TODO Leo:
 *  - Disparar reload() automáticamente cuando se registre una nueva venta en el POS.
 */
import { useState, useEffect } from 'react';
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const openCash = async (initialAmount) => {
    await cashService.openRegister(initialAmount);
    await fetchStatus();
  };

  const closeCash = async (closeData) => {
    await cashService.closeRegister(closeData);
    await fetchStatus();
  };

  return {
    cashStatus,
    loading,
    reload: fetchStatus,
    openCash,
    closeCash,
  };
};
