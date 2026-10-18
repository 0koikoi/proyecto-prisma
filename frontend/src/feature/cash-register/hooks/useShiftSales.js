/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Hook de Ventas del Turno
 *
 * Carga las ventas del turno abierto (para consultarlas y reimprimir su ticket).
 * Se vacía cuando el turno se cierra y se vuelve a cargar al abrir uno nuevo.
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { posService } from '../../pos/services/posService';

export const useShiftSales = (enabled) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setSales([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    posService
      .getShiftSales()
      .then((data) => {
        if (!cancelled) setSales(data);
      })
      .catch((err) => {
        console.error('Error fetching shift sales:', err);
        if (!cancelled) toast.error('No se pudieron cargar las ventas del turno.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { sales, loading };
};
