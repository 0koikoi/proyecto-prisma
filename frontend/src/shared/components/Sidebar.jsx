/**
 * Módulo: Navegación principal
 * Menú lateral desplegable con desenfoque de fondo.
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  ClipboardList,
  Truck,
  TrendingUp,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuthContext } from '../../core/context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'DASHBOARD', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'PUNTO DE VENTA (POS)', path: ROUTES.POS, icon: ShoppingCart },
    { label: 'INVENTARIO', path: ROUTES.INVENTORY, icon: Package },
    { label: 'CAJA', path: ROUTES.CASH_REGISTER, icon: DollarSign },
    { label: 'PEDIDOS', path: ROUTES.ORDERS, icon: ClipboardList },
    { label: 'PROVEEDORES', path: ROUTES.SUPPLIERS, icon: Truck },
    ...(isAdmin ? [{ label: 'REPORTE FINANCIERO', path: ROUTES.FINANCIAL_REPORTS, icon: TrendingUp }] : []),
  ];

  return (
    <>
      {/* Fondo con desenfoque */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Cerrar menú de navegación"
        />
      )}

      {/* Menú lateral */}
      <aside
        className={`sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Encabezado */}
        <div className="sidebar-brand">
          <div className="flex items-center gap-3">
            <span className="brand-badge">P</span>
            <div>
              <p className="font-extrabold text-white text-base tracking-wider uppercase">Prisma</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Gestión Interna</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
            title="Cerrar menú"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Enlaces de navegación */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto py-2">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === ROUTES.DASHBOARD}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate tracking-wider text-xs font-semibold">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Pie de menú */}
        <div className="border-t border-white/10 pt-4 mt-auto flex flex-col gap-1.5">
          {isAdmin && (
            <NavLink
              to={ROUTES.SETTINGS}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <Settings size={18} className="shrink-0" />
              <span className="truncate tracking-wider text-xs font-semibold">CONFIGURACIÓN</span>
            </NavLink>
          )}

          <button
            className="flex items-center gap-3.5 px-4 py-3 mx-2 rounded-xl text-red-400
                       text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all
                       hover:bg-red-500/15 hover:text-red-300 border-none bg-transparent"
            onClick={logout}
            type="button"
          >
            <LogOut size={18} className="shrink-0" />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </aside>
    </>
  );
};
