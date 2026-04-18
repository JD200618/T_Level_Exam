import { useEffect, useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, Button } from '../../components/ui/core';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminInventory, getAdminOrders, getAdminOverview } from '../../lib/api';
import { Link } from 'react-router';

export function DashboardOverview() {
  const [overview, setOverview] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    void Promise.all([getAdminOverview(), getAdminInventory(), getAdminOrders()])
      .then(([overviewData, inventoryData, orderData]) => {
        setOverview(overviewData);
        setInventory(inventoryData);
        setOrders(orderData);
        setLoadError('');
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard data.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const lowStockProducts = useMemo(
    () => inventory.filter((item) => item.stockLevel <= item.lowStockThreshold),
    [inventory],
  );

  const statusData = useMemo(() => {
    const counts = orders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [orders]);

  const revenueData = useMemo(() => {
    const byMonth = orders.reduce((acc: Record<string, number>, order) => {
      const key = new Date(order.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      acc[key] = (acc[key] || 0) + order.total;
      return acc;
    }, {});
    return Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${overview.revenue.toFixed(2)}`,
      subtitle: 'Paid orders',
      icon: DollarSign,
      color: '#2E7D32',
      bgColor: '#A5D6A7',
    },
    {
      title: 'Total Orders',
      value: overview.orders,
      subtitle: 'All time',
      icon: ShoppingCart,
      color: '#FF9800',
      bgColor: '#FFE0B2',
    },
    {
      title: 'Products',
      value: overview.products,
      subtitle: 'Active catalog',
      icon: Package,
      color: '#2E7D32',
      bgColor: '#A5D6A7',
    },
    {
      title: 'Customers',
      value: overview.customers,
      subtitle: 'Registered customers',
      icon: Users,
      color: '#FF9800',
      bgColor: '#FFE0B2',
    },
  ];

  if (isLoading) {
    return <div className="p-6" style={{ color: '#6B6B6B' }}>Loading dashboard...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#6B6B6B' }}>
          Live operational snapshot from the connected backend.
        </p>
      </div>

      {loadError && (
        <Card className="p-4" style={{ borderLeft: '4px solid #FF9800', backgroundColor: '#FFF9E6' }}>
          <p style={{ color: '#2E2E2E', fontWeight: 600 }}>Dashboard connection issue</p>
          <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>{loadError}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm mb-2" style={{ color: '#6B6B6B' }}>
                    {kpi.title}
                  </p>
                  <p className="text-3xl mb-1" style={{ color: '#2E2E2E', fontWeight: 700 }}>
                    {kpi.value}
                  </p>
                  <p className="text-xs" style={{ color: '#6B6B6B' }}>
                    {kpi.subtitle}
                  </p>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: kpi.bgColor }}
                >
                  <Icon className="h-6 w-6" style={{ color: kpi.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <TrendingUp className="h-5 w-5" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <h3 style={{ color: '#2E2E2E' }}>Order Status Distribution</h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Current order mix by status
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="status" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip />
              <Bar dataKey="count" fill="#2E7D32" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
              <DollarSign className="h-5 w-5" style={{ color: '#FF9800' }} />
            </div>
            <div>
              <h3 style={{ color: '#2E2E2E' }}>Revenue by Month</h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Based on stored order totals
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="month" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FF9800" strokeWidth={3} dot={{ fill: '#FF9800', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="p-6" style={{ borderLeft: '4px solid #FF9800' }}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#FF9800' }} />
            </div>
            <div className="flex-1">
              <h3 className="mb-2" style={{ color: '#2E2E2E' }}>
                Low Stock Alert
              </h3>
              <p className="mb-4" style={{ color: '#6B6B6B' }}>
                {lowStockProducts.length} product(s) are running low on stock
              </p>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FAFAF5' }}>
                    <div>
                      <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{product.name}</p>
                      <p className="text-sm" style={{ color: '#6B6B6B' }}>
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm mb-1" style={{ color: '#FF9800', fontWeight: 600 }}>
                        Only {product.stockLevel} left
                      </p>
                      <p className="text-xs" style={{ color: '#6B6B6B' }}>
                        Threshold: {product.lowStockThreshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/dashboard/inventory">
                  <Button size="sm" style={{ backgroundColor: '#FF9800' }}>
                    Manage Inventory
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/orders">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                <ShoppingCart className="h-6 w-6" style={{ color: '#2E7D32' }} />
              </div>
              <div>
                <h4 style={{ color: '#2E2E2E' }}>Manage Orders</h4>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  View and process real orders
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/customers">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
                <Users className="h-6 w-6" style={{ color: '#FF9800' }} />
              </div>
              <div>
                <h4 style={{ color: '#2E2E2E' }}>Customer Insights</h4>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  Spend and order activity
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/analytics">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                <BarChart3 className="h-6 w-6" style={{ color: '#2E7D32' }} />
              </div>
              <div>
                <h4 style={{ color: '#2E2E2E' }}>Product Analytics</h4>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  Best sellers and revenue
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
