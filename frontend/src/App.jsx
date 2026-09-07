/**
 * RESPONSABLE: Keila
 * MÓDULO: Enrutamiento Principal
 *
 * Define todas las rutas del sistema de gestión de Tienda Prisma.
 * Las rutas protegidas requieren autenticación (ProtectedRoute).
 *
 * TODO Keila: Agregar guard de ROL en las rutas de Reporte Financiero y Configuración
 *             para que solo el rol ADMIN pueda accederlas (HU02 del plan prisma.md).
 * TODO Keila: Cuando el backend esté listo, conectar AuthContext con el token JWT real.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import { ProtectedRoute } from './core/guards/ProtectedRoute';
import { MainLayout } from './shared/components/MainLayout';
import { ROUTES } from './shared/constants/routes';

// Páginas
import { LoginPage }           from './feature/auth/LoginPage';
import { DashboardPage }       from './feature/dashboard/DashboardPage';
import { InventoryPage }       from './feature/inventory/InventoryPage';
import { PosPage }             from './feature/pos/PosPage';
import { CashRegisterPage }    from './feature/cash-register/CashRegisterPage';
import { OrdersPage }          from './feature/orders/OrdersPage';
import { SuppliersPage }       from './feature/suppliers/SuppliersPage';
import { FinancialReportsPage } from './feature/financial-reports/FinancialReportsPage';
import { SettingsPage }        from './feature/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Protegidas — requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.DASHBOARD}         element={<DashboardPage />} />
              <Route path={ROUTES.INVENTORY}         element={<InventoryPage />} />
              <Route path={ROUTES.POS}               element={<PosPage />} />
              <Route path={ROUTES.CASH_REGISTER}     element={<CashRegisterPage />} />
              <Route path={ROUTES.ORDERS}            element={<OrdersPage />} />
              <Route path={ROUTES.SUPPLIERS}         element={<SuppliersPage />} />
              {/* Restringido solo al rol ADMIN (RF02 / HU02) */}
              <Route
                path={ROUTES.FINANCIAL_REPORTS}
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FinancialReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.SETTINGS}
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
