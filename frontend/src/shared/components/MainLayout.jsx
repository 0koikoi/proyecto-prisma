/**
 * Layout principal
 * Contenedor general con menú lateral y barra superior.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout-root">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="layout-content-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="layout-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
