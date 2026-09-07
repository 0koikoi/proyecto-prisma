/**
 * RESPONSABLE: Mauricio
 * MÓDULO: Inventario — Hook de Estado de Inventario
 *
 * Encapsula la lógica de consulta, filtrado por búsqueda (nombre/SKU/código de barras)
 * y filtro por categoría.
 *
 * TODO Mauricio:
 *  - Agregar filtro de "solo bajo stock" para auditar rápidamente productos por reponer.
 *  - Conectar reload() después de crear, editar o eliminar un producto.
 */
import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';

export const useInventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getCategories(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q));

    const matchesCategory =
      categoryFilter === 'ALL' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    reload: fetchProducts,
  };
};
