/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Hook de Catálogo
 *
 * Carga el catálogo vendible del mostrador (variantes con stock disponible) y permite
 * refrescarlo sin parpadeo tras una venta, para que el stock mostrado sea el real.
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { posService } from '../services/posService';

export const usePosCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setProducts(await posService.getCatalog());
    } catch (err) {
      console.error('Error fetching POS catalog:', err);
      toast.error('No se pudo cargar el catálogo del mostrador.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { products, loading, reload };
};
