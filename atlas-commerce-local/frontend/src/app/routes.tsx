import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Layout,
      children: [
        { index: true, lazy: async () => ({ Component: (await import('./pages/Home')).Home }) },
        { path: 'shop', lazy: async () => ({ Component: (await import('./pages/Shop')).Shop }) },
        { path: 'producers', lazy: async () => ({ Component: (await import('./pages/Producers')).Producers }) },
        { path: 'cart', lazy: async () => ({ Component: (await import('./pages/Cart')).Cart }) },
        { path: 'checkout', lazy: async () => ({ Component: (await import('./pages/Checkout')).Checkout }) },
        { path: 'account', lazy: async () => ({ Component: (await import('./pages/Account')).Account }) },
      ],
    },
    {
      path: '/login',
      lazy: async () => ({ Component: (await import('./pages/Login')).Login }),
    },
    {
      path: '/admin-login',
      lazy: async () => ({ Component: (await import('./pages/AdminLogin')).AdminLogin }),
    },
    {
      path: '/dashboard',
      Component: DashboardLayout,
      children: [
        { index: true, lazy: async () => ({ Component: (await import('./pages/dashboard/Overview')).DashboardOverview }) },
        { path: 'inventory', lazy: async () => ({ Component: (await import('./pages/dashboard/Inventory')).DashboardInventory }) },
        { path: 'orders', lazy: async () => ({ Component: (await import('./pages/dashboard/Orders')).DashboardOrders }) },
        { path: 'customers', lazy: async () => ({ Component: (await import('./pages/dashboard/Customers')).DashboardCustomers }) },
        { path: 'analytics', lazy: async () => ({ Component: (await import('./pages/dashboard/Analytics')).DashboardAnalytics }) },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);