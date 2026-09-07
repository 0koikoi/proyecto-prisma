/**
 * RESPONSABLE: Keila
 * MÓDULO: Layout Principal
 *
 * Layout envuelve todas las páginas protegidas del sistema.
 * Estructura: Sidebar izquierdo fijo + Navbar superior + contenido con <Outlet />.
 *
 * No modificar este archivo sin coordinar con Zully (Líder del Proyecto) — afecta todas las vistas.
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout = () => {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-content-wrapper">
        <Navbar />
        <main className="layout-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
