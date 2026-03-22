import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminShell from '../components/layout/AdminShell';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ProductsListPage from '../features/products/pages/ProductsListPage';
import ProductFormPage from '../features/products/pages/ProductFormPage';
import CategoriesPage from '../features/categories/pages/CategoriesPage';
import OrdersListPage from '../features/orders/pages/OrdersListPage';
import OrderDetailsPage from '../features/orders/pages/OrderDetailsPage';
import CustomersListPage from '../features/customers/pages/CustomersListPage';
import CouponsPage from '../features/marketing/pages/CouponsPage';
import FlashSalesPage from '../features/marketing/pages/FlashSalesPage';
import BannersPage from '../features/marketing/pages/BannersPage';
import SitePagesPage from '../features/marketing/pages/SitePagesPage';
import ReviewsManagementPage from '../features/reviews/pages/ReviewsManagementPage';
import SalesReportPage from '../features/reports/pages/SalesReportPage';
import SupportPage from '../features/support/pages/SupportPage';
import SettingsPage from '../features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductsListPage /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/:id/edit', element: <ProductFormPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'orders', element: <OrdersListPage /> },
      { path: 'orders/:id', element: <OrderDetailsPage /> },
      { path: 'customers', element: <CustomersListPage /> },
      { path: 'reviews', element: <ReviewsManagementPage /> },
      { path: 'marketing/coupons', element: <CouponsPage /> },
      { path: 'marketing/flash-sales', element: <FlashSalesPage /> },
      { path: 'marketing/banners', element: <BannersPage /> },
      { path: 'marketing/pages', element: <SitePagesPage /> },
      { path: 'reports/sales', element: <SalesReportPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'settings/app', element: <SettingsPage /> },
      { path: 'settings/payments', element: <SettingsPage /> },
      { path: 'settings/shipping', element: <SettingsPage /> },
      { path: 'settings/admins', element: <SettingsPage /> },
    ],
  },
]);
