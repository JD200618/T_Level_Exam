import { useEffect, useMemo, useState } from 'react';
import { Users, TrendingUp, Star, Award } from 'lucide-react';
import { Card, Badge } from '../../components/ui/core';

import { getAdminCustomers } from '../../lib/api';

export function DashboardCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    void getAdminCustomers().then(setCustomers);
  }, []);

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpend, 0);
  const totalOrders = customers.reduce((sum, customer) => sum + customer.orderCount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const tierCounts = useMemo(
    () => ({
      platinum: customers.filter((customer) => customer.loyaltyTier === 'platinum').length,
      gold: customers.filter((customer) => customer.loyaltyTier === 'gold').length,
      silver: customers.filter((customer) => customer.loyaltyTier === 'silver').length,
      bronze: customers.filter((customer) => customer.loyaltyTier === 'bronze').length,
    }),
    [customers],
  );

  const getLoyaltyTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'Platinum', style: { backgroundColor: '#757575', color: 'white' } };
      case 'gold':
        return { label: 'Gold', style: { backgroundColor: '#FFC107', color: '#2E2E2E' } };
      case 'silver':
        return { label: 'Silver', style: { backgroundColor: '#E0E0E0', color: '#2E2E2E' } };
      default:
        return { label: 'Bronze', style: { backgroundColor: '#D7CCC8', color: '#2E2E2E' } };
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
          Customer Insights & Loyalty
        </h1>
        <p style={{ color: '#6B6B6B' }}>
          Spend patterns and order activity from the live backend
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <Users className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Total Customers</p>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{totalCustomers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
              <TrendingUp className="h-6 w-6" style={{ color: '#FF9800' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Total Revenue</p>
              <p className="text-2xl" style={{ color: '#2E7D32', fontWeight: 700 }}>${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
              <Star className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Avg. Order Value</p>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>${avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#FFE0B2' }}>
            <Award className="h-5 w-5" style={{ color: '#FF9800' }} />
          </div>
          <div>
            <h3 style={{ color: '#2E2E2E' }}>Loyalty Tier Distribution</h3>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Derived from total customer spend
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['platinum', 'gold', 'silver', 'bronze'] as const).map((tier) => (
            <div key={tier} className="p-4 rounded-lg" style={{ backgroundColor: '#FAFAF5' }}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      tier === 'platinum' ? '#757575' : tier === 'gold' ? '#FFC107' : tier === 'silver' ? '#E0E0E0' : '#D7CCC8',
                  }}
                ></div>
                <span className="text-sm capitalize" style={{ color: '#6B6B6B' }}>{tier}</span>
              </div>
              <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>
                {tierCounts[tier]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h3 className="mb-4" style={{ color: '#2E2E2E' }}>
          Customer Profiles
        </h3>
        <div className="space-y-4">
          {sortedCustomers.map((customer, index) => {
            const tierBadge = getLoyaltyTierBadge(customer.loyaltyTier);
            return (
              <Card key={customer.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                          <span className="text-lg" style={{ color: '#2E7D32', fontWeight: 700 }}>
                            {customer.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 style={{ color: '#2E2E2E' }}>{customer.name}</h4>
                            <Badge style={tierBadge.style}>{tierBadge.label}</Badge>
                            {index < 3 && (
                              <Badge style={{ backgroundColor: '#FFE0B2', color: '#FF9800' }}>
                                Top {index + 1}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: '#6B6B6B' }}>{customer.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAFAF5' }}>
                        <p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Total Spend</p>
                        <p className="text-lg" style={{ color: '#2E7D32', fontWeight: 700 }}>${customer.totalSpend.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAFAF5' }}>
                        <p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Orders</p>
                        <p className="text-lg" style={{ color: '#2E2E2E', fontWeight: 700 }}>{customer.orderCount}</p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAFAF5' }}>
                        <p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Avg. Order</p>
                        <p className="text-lg" style={{ color: '#2E2E2E', fontWeight: 700 }}>${customer.avgOrderValue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
