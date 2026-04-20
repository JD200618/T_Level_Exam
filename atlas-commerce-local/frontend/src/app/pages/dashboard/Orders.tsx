import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, Badge } from '../../components/ui/core';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getAdminOrders, updateAdminOrderStatus, type AdminOrder } from '../../lib/api';
import { toast } from 'sonner';

type OrderStatus = 'all' | 'pending' | 'paid' | 'delivered' | 'collected';
type ManageableOrderStatus = Exclude<OrderStatus, 'all'>;

const ORDER_STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  countLabel: string;
  color: string;
  badgeStyle?: { backgroundColor: string; color: string };
}[] = [
  {
    value: 'all',
    label: 'All Orders',
    countLabel: 'All Orders',
    color: '#2E2E2E',
  },
  {
    value: 'pending',
    label: 'Pending',
    countLabel: 'Pending',
    color: '#FFC107',
    badgeStyle: { backgroundColor: '#FFC107', color: '#2E2E2E' },
  },
  {
    value: 'paid',
    label: 'Paid',
    countLabel: 'Paid',
    color: '#2E7D32',
    badgeStyle: { backgroundColor: '#A5D6A7', color: '#2E2E2E' },
  },
  {
    value: 'delivered',
    label: 'Delivered',
    countLabel: 'Delivered',
    color: '#2E7D32',
    badgeStyle: { backgroundColor: '#2E7D32', color: 'white' },
  },
  {
    value: 'collected',
    label: 'Collected',
    countLabel: 'Collected',
    color: '#166534',
    badgeStyle: { backgroundColor: '#166534', color: 'white' },
  },
];

function getStatusCounts(orders: AdminOrder[]) {
  return {
    all: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    paid: orders.filter((order) => order.status === 'paid').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    collected: orders.filter((order) => order.status === 'collected').length,
  };
}

function getStatusBadge(status: string) {
  const match = ORDER_STATUS_OPTIONS.find((option) => option.value === status);
  if (!match?.badgeStyle) {
    return { label: status, style: { backgroundColor: '#6B6B6B', color: 'white' } };
  }

  return {
    label: match.label,
    style: match.badgeStyle,
  };
}

export function DashboardOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus>('all');

  const loadOrders = async () => {
    const data = await getAdminOrders();
    setOrders(data);
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((order) => order.status === filterStatus);

  const handleUpdateStatus = async (orderId: number, newStatus: ManageableOrderStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      await loadOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update order');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusCounts = getStatusCounts(orders);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
          Order Management
        </h1>
        <p style={{ color: '#6B6B6B' }}>
          View and manage live customer orders
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ORDER_STATUS_OPTIONS.map((option) => (
          <Card key={option.value} className="p-4">
            <p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>{option.countLabel}</p>
            <p className="text-2xl" style={{ color: option.color, fontWeight: 700 }}>
              {statusCounts[option.value]}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label style={{ color: '#2E2E2E', fontWeight: 600 }}>Filter by Status:</label>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as OrderStatus)}>
            <SelectTrigger className="w-48" style={{ borderColor: '#A5D6A7' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {ORDER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({statusCounts[option.value]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusBadge = getStatusBadge(order.status);
          return (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 style={{ color: '#2E2E2E' }}>Order #{order.orderNumber}</h3>
                    <Badge style={statusBadge.style}>{statusBadge.label}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p style={{ color: '#6B6B6B' }}>Customer</p>
                      <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{order.customerName}</p>
                      <p className="text-xs" style={{ color: '#6B6B6B' }}>{order.customerEmail}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6B6B6B' }}>Date</p>
                      <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{formatDate(order.date)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6B6B6B' }}>Payment</p>
                      <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{order.paymentStatus}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6B6B6B' }}>Fulfilment</p>
                      <p style={{ color: '#2E2E2E', fontWeight: 600, textTransform: 'capitalize' }}>{order.fulfillmentMethod}</p>
                      {order.requestedWindow && (
                        <p className="text-xs" style={{ color: '#6B6B6B' }}>{order.requestedWindow}</p>
                      )}
                    </div>
                    <div>
                      <p style={{ color: '#6B6B6B' }}>Total</p>
                      <p className="text-xl" style={{ color: '#2E7D32', fontWeight: 700 }}>${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Select value={order.status} onValueChange={(value) => void handleUpdateStatus(order.orderId, value as ManageableOrderStatus)}>
                  <SelectTrigger className="w-40" style={{ borderColor: '#2E7D32' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4" style={{ color: '#A5D6A7' }} />
          <p style={{ color: '#6B6B6B' }}>
            No orders found with status "{filterStatus}"
          </p>
        </Card>
      )}
    </div>
  );
}
