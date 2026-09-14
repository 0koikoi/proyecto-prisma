/**
 * RESPONSABLE: Keila / Zully
 * MÓDULO: Configuración del Sistema (Admin)
 *
 * Gestión de usuarios, categorías y parámetros comerciales de Tienda Prisma.
 * Acceso restringido al rol ADMIN.
 */
import { useState } from 'react';
import { User, Shield, Tag, Plus, CheckCircle, Edit2, Store, DollarSign, Bell } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { useToast } from '../../core/context/ToastContext';

export const SettingsPage = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([
    { id: 1, name: 'Zully Tello', username: 'admin', role: 'ADMIN', active: true, lastLogin: 'Hoy, 09:15' },
    { id: 2, name: 'Personal Mostrador', username: 'vendedor', role: 'VENDEDOR', active: true, lastLogin: 'Ayer, 18:30' },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Ropa Femenina', count: 12, description: 'Vestidos, blusas, pantalones de temporada' },
    { id: 2, name: 'Línea Urbana', count: 8, description: 'Poleras oversize, joggers unisex' },
    { id: 3, name: 'Accesorios Mascotas', count: 6, description: 'Capas impermeables, correas y bandanas' },
  ]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState('VENDEDOR');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim()) return;
    const user = {
      id: Date.now(),
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      role: newUserRole,
      active: true,
      lastLogin: 'Reciente',
    };
    setUsers([...users, user]);
    setIsUserModalOpen(false);
    setNewUserName('');
    setNewUserUsername('');
    showToast(`Usuario "${user.name}" creado con éxito.`, 'success');
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = {
      id: Date.now(),
      name: newCategoryName.trim(),
      count: 0,
      description: newCategoryDesc.trim() || 'Categoría de productos',
    };
    setCategories([...categories, cat]);
    setIsCategoryModalOpen(false);
    setNewCategoryName('');
    setNewCategoryDesc('');
    showToast(`Categoría "${cat.name}" añadida con éxito.`, 'success');
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    showToast('Estado del usuario actualizado.', 'info');
  };

  return (
    <div className="page-container">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1>Configuración del Sistema</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestión de accesos, roles de personal y categorías comerciales de Tienda Prisma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestión de Usuarios */}
        <div className="content-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Personal y Roles (RF02)</h3>
                <p className="text-xs text-gray-500">Cuentas autorizadas para operar el sistema</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsUserModalOpen(true)}
            >
              Nuevo Usuario
            </Button>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#d6efff] text-[#1c1c1c] font-bold text-xs flex items-center justify-center shrink-0">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username} · Último acceso: {u.lastLogin}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`badge text-[11px] font-semibold ${
                      u.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'
                    }`}
                  >
                    <Shield size={11} className="mr-1 inline" />
                    {u.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleUserStatus(u.id)}
                    className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer border-none ${
                      u.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {u.active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorías del Negocio */}
        <div className="content-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                <Tag size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Líneas de Negocio</h3>
                <p className="text-xs text-gray-500">Categorías de catálogo en tienda física y web</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCategoryModalOpen(true)}
            >
              Nueva Línea
            </Button>
          </div>

          <div className="flex flex-col gap-2.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-gray-100 bg-[#f9fafb] flex items-center justify-between gap-3 hover:border-gray-200 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                    <span className="badge badge-neutral text-[10px]">{cat.count} productos</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{cat.description}</p>
                </div>
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors border-none bg-transparent cursor-pointer"
                  onClick={() => showToast(`Editando línea ${cat.name}`, 'info')}
                  title="Editar categoría"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Parámetros Operativos */}
        <div className="content-card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Parámetros Operativos de la Tienda</h3>
              <p className="text-xs text-gray-500">Configuración de moneda, alertas y comprobantes de venta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-[#f9fafb]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                <DollarSign size={14} />
                Moneda Principal
              </div>
              <p className="text-base font-bold text-gray-900">Soles Peruanos (PEN - S/)</p>
              <p className="text-xs text-gray-400 mt-1">Formato contable estándar nacional</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-[#f9fafb]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                <Bell size={14} />
                Umbral Alerta de Stock
              </div>
              <p className="text-base font-bold text-gray-900">3 unidades</p>
              <p className="text-xs text-gray-400 mt-1">Aviso visual automático en Inventario y POS</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-[#f9fafb]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                <CheckCircle size={14} />
                Comprobante POS
              </div>
              <p className="text-base font-bold text-gray-900">Ticket de Venta / Boleta</p>
              <p className="text-xs text-gray-400 mt-1">Impresión térmica rápida 80mm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Usuario */}
      {isUserModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3">Registrar Personal</h3>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ej: Rosa Huamán"
                  className="input input-md w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  required
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="Ej: rhuaman"
                  className="input input-md w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Rol en Tienda</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="input input-md w-full"
                >
                  <option value="VENDEDOR">VENDEDOR (POS, Caja, Inventario lectura)</option>
                  <option value="ADMIN">ADMIN (Acceso total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button variant="secondary" size="md" onClick={() => setIsUserModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {isCategoryModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3">Nueva Línea de Negocio</h3>
            <form onSubmit={handleCreateCategory} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre de la Línea</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Calzado Urbano"
                  className="input input-md w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Descripción</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Zapatillas y medias unisex"
                  className="input input-md w-full"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button variant="secondary" size="md" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Guardar Línea
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
