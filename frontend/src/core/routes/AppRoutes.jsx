/**
 * RESPONSABLE: Keila
 * MÓDULO: Enrutamiento Centralizado
 *
 * Mapeo de rutas protegidas y públicas del sistema de gestión.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';
import { MainLayout } from '../../shared/components/MainLayout';
import { ProtectedRoute } from '../guards/ProtectedRoute';

import { LoginPage } from '../../feature/auth';
import { DashboardPage } from '../../feature/dashboard';
import { PosPage } from '../../feature/pos';
import { InventoryPage } from '../../feature/inventory';
import { CashRegisterPage } from '../../feature/cash-register';
import { OrdersPage } from '../../feature/orders';
import { SuppliersPage } from '../../feature/suppliers';
import { FinancialReportsPage } from '../../feature/financial-reports';
import { SettingsPage } from '../../feature/settings/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path={ROUTES.POS} element={<PosPage />} />
        <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
        <Route path={ROUTES.CASH_REGISTER} element={<CashRegisterPage />} />
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
        <Route path={ROUTES.SUPPLIERS} element={<SuppliersPage />} />
        {/* Solo ADMIN */}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
