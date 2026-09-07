/**
 * RESPONSABLE: Keila
 * MÓDULO: Layout Principal / Dashboard
 *
 * Sidebar de navegación del sistema de gestión.
 * Incluye todos los módulos definidos en el plan prisma.md (sección 4).
 *
 * TODO Keila: Si se agrega una nueva vista, registrar el ítem en navItems.
 * TODO Keila: Ajustar el diseño visual según los wireframes aprobados.
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
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuthContext } from '../../core/context/AuthContext';

export const Sidebar = () => {
  const { logout, user } = useAuthContext();

  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Punto de Venta (POS)', path: ROUTES.POS, icon: ShoppingCart },
    { label: 'Inventario', path: ROUTES.INVENTORY, icon: Package },
    { label: 'Caja', path: ROUTES.CASH_REGISTER, icon: DollarSign },
    { label: 'Pedidos', path: ROUTES.ORDERS, icon: ClipboardList },
    { label: 'Proveedores', path: ROUTES.SUPPLIERS, icon: Truck },
    ...(isAdmin ? [{ label: 'Reporte Financiero', path: ROUTES.FINANCIAL_REPORTS, icon: TrendingUp }] : []),
  ];

  return (
    <aside className="sidebar">
      {/* Logo / Marca */}
      <div className="sidebar-brand">
        <span className="brand-badge">P</span>
        <div>
          <p className="font-bold text-white text-sm leading-tight">Prisma</p>
          <p className="text-xs text-gray-500">Gestión Interna</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer: configuración (solo ADMIN) y logout */}
      <div className="border-t border-white/10 pt-4 flex flex-col gap-1">
        {isAdmin && (
          <NavLink
            to={ROUTES.SETTINGS}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <Settings size={18} />
            <span>Configuración</span>
          </NavLink>
        )}

        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400
                     text-sm font-medium cursor-pointer transition-colors hover:bg-red-900/20
                     w-full border-none bg-transparent"
          onClick={logout}
          type="button"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
