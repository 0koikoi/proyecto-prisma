/**
 * RESPONSABLE: Keila
 * MÓDULO: Layout Principal
 *
 * Barra de navegación superior del sistema de gestión.
 * Muestra el estado de la tienda, notificaciones y perfil del usuario.
 *
 * TODO Keila: Conectar con el contexto de CashRegister para mostrar
 *             si hay caja abierta o cerrada (en lugar del texto estático).
 * TODO Keila: Implementar el dropdown de perfil de usuario.
 */
import { Bell, User } from 'lucide-react';
import { useAuthContext } from '../../core/context/AuthContext';

export const Navbar = () => {
  const { user } = useAuthContext();

  return (
    <header className="navbar">
      {/* Izquierda: badge de estado de tienda */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1.5">
        {/* TODO Keila: cambiar este indicador según el estado real de la caja */}
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-200"></span>
        <span>Tienda abierta</span>
      </div>

      {/* Derecha: notificaciones y perfil */}
      <div className="flex items-center gap-3">
        {/* TODO Keila: conectar las notificaciones con alertas de stock bajo */}
        <button
          className="w-9 h-9 flex items-center justify-center border border-gray-200
                     rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          type="button"
          title="Notificaciones"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <User size={16} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {user?.name ?? 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">{user?.role ?? 'Personal'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
