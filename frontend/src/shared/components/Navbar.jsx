/**
 * Barra de navegación superior
 * Estado de tienda, notificaciones y perfil.
 *
 * TODO Keila: Conectar con el contexto de CashRegister para mostrar
 *             si hay caja abierta o cerrada (en lugar del texto estático).
 * TODO Keila: Implementar el dropdown de perfil de usuario.
 */
import { Bell, User, Menu } from 'lucide-react';
import { useAuthContext } from '../../core/context/AuthContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuthContext();

  return (
    <header className="navbar">
      {/* Acceso y marca */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hamburger-btn"
          title="Abrir menú de navegación"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 bg-[#1c1c1c] text-white rounded-lg flex items-center justify-center font-extrabold text-xs shadow-sm">
            P
          </span>
          <span className="font-extrabold text-sm tracking-widest uppercase text-[#1c1c1c]">
            Prisma
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-gray-700 bg-gray-100/90 rounded-full px-3 py-1 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-200"></span>
          <span>Tienda abierta</span>
        </div>
      </div>

      {/* Notificaciones y usuario */}
      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center border border-gray-200/80
                     rounded-xl text-gray-700 hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          type="button"
          title="Notificaciones"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-xl bg-[#1c1c1c] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={15} />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-[#1c1c1c] leading-tight uppercase tracking-wider">
              {user?.name ?? 'Usuario'}
            </p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
              {user?.role ?? 'Personal'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
