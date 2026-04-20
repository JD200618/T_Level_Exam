import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminAnalytics, type AdminAnalytics } from '../../lib/api';

export function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState<AdminAnalytics>({ revenueByStatus: [], topProducts: [] });

  useEffect(() => {
    void getAdminAnalytics().then(setAnalytics);
  }, []);

  const topProducts = analytics.topProducts.slice(0, 5);
  const totalUnitsSold = analytics.topProducts.reduce((sum, product) => sum + product.totalSold, 0);
  const totalRevenue = analytics.topProducts.reduce((sum, product) => sum + product.revenue, 0);

  const chartData = useMemo(
    () => analytics.revenueByStatus.map((row) => ({ status: row.status, revenue: row.revenue, orders: row.orders })),
    [analytics.revenueByStatus],
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
          Product Analytics
        </h1>
        <p style={{ color: '#6B6B6B' }}>
          Best sellers and revenue data from the live backend
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <BarChart3 className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Total Units Sold</p>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{totalUnitsSold}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
              <DollarSign className="h-6 w-6" style={{ color: '#FF9800' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Top Product Revenue</p>
              <p className="text-2xl" style={{ color: '#2E7D32', fontWeight: 700 }}>${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <TrendingUp className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Products Tracked</p>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{analytics.topProducts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
            <DollarSign className="h-5 w-5" style={{ color: '#FF9800' }} />
          </div>
          <div>
            <h3 style={{ color: '#2E2E2E' }}>Revenue by Order Status</h3>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Revenue and order counts grouped by status
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="status" stroke="#6B6B6B" />
            <YAxis stroke="#6B6B6B" />
            <Tooltip />
            <Bar dataKey="revenue" fill="#2E7D32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
            <TrendingUp className="h-5 w-5" style={{ color: '#2E7D32' }} />
          </div>
          <div>
            <h3 style={{ color: '#2E2E2E' }}>Top 5 Most Bought Products</h3>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Ranked by units sold
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.productName} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#FAFAF5' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: index === 0 ? '#FFC107' : '#A5D6A7' }}>
                <span className="text-lg" style={{ color: index === 0 ? '#2E2E2E' : '#2E7D32', fontWeight: 700 }}>
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{product.productName}</p>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>{product.totalSold} units sold</p>
              </div>
              <div className="text-right">
                <p style={{ color: '#2E7D32', fontWeight: 700 }}>${product.revenue.toFixed(2)}</p>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
