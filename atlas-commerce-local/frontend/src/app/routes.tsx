import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { DashboardLayout } from './components/DashboardLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Producers } from './pages/Producers';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { Checkout } from './pages/Checkout';
import { AdminLogin } from './pages/AdminLogin';
import { DashboardOverview } from './pages/dashboard/Overview';
import { DashboardInventory } from './pages/dashboard/Inventory';
import { DashboardOrders } from './pages/dashboard/Orders';
import { DashboardCustomers } from './pages/dashboard/Customers';
import { DashboardAnalytics } from './pages/dashboard/Analytics';
import { SystemArchitecture } from './pages/SystemArchitecture';
import { DataDictionary } from './pages/DataDictionary';
import { Flowcharts } from './pages/Flowcharts';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Layout,
      children: [
        { index: true, Component: Home },
        { path: 'shop', Component: Shop },
        { path: 'producers', Component: Producers },
        { path: 'cart', Component: Cart },
        { path: 'checkout', Component: Checkout },
        { path: 'account', Component: Account },
      ],
    },
    {
      path: '/login',
      Component: Login,
    },
    {
      path: '/admin-login',
      Component: AdminLogin,
    },
    {
      path: '/system-architecture',
      Component: SystemArchitecture,
    },
    {
      path: '/data-dictionary',
      Component: DataDictionary,
    },
    {
      path: '/flowcharts',
      Component: Flowcharts,
    },
    {
      path: '/dashboard',
      Component: DashboardLayout,
      children: [
        { index: true, Component: DashboardOverview },
        { path: 'inventory', Component: DashboardInventory },
        { path: 'orders', Component: DashboardOrders },
        { path: 'customers', Component: DashboardCustomers },
        { path: 'analytics', Component: DashboardAnalytics },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);