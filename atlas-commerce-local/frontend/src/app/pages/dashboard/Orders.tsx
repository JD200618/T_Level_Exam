import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getAdminOrders, updateAdminOrderStatus } from '../../lib/api';
import { toast } from 'sonner';

type OrderStatus = 'all' | 'pending' | 'paid' | 'delivered' | 'collected';

export function DashboardOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus>('all');

  const loadOrders = async () => {
    const data = await getAdminOrders();
    setOrders(data);
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = useMemo(
    () => (filterStatus === 'all' ? orders : orders.filter((order) => order.status === filterStatus)),
    [orders, filterStatus],
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', style: { backgroundColor: '#FFC107', color: '#2E2E2E' } };
      case 'paid':
        return { label: 'Paid', style: { backgroundColor: '#A5D6A7', color: '#2E2E2E' } };
      case 'delivered':
        return { label: 'Delivered', style: { backgroundColor: '#2E7D32', color: 'white' } };
      case 'collected':
        return { label: 'Collected', style: { backgroundColor: '#166534', color: 'white' } };
      default:
        return { label: status, style: { backgroundColor: '#6B6B6B', color: 'white' } };
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: 'pending' | 'paid' | 'delivered' | 'collected') => {
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

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    collected: orders.filter((o) => o.status === 'collected').length,
  };

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
        <Card className="p-4"><p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>All Orders</p><p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{statusCounts.all}</p></Card>
        <Card className="p-4"><p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Pending</p><p className="text-2xl" style={{ color: '#FFC107', fontWeight: 700 }}>{statusCounts.pending}</p></Card>
        <Card className="p-4"><p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Paid</p><p className="text-2xl" style={{ color: '#2E7D32', fontWeight: 700 }}>{statusCounts.paid}</p></Card>
        <Card className="p-4"><p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Delivered</p><p className="text-2xl" style={{ color: '#2E7D32', fontWeight: 700 }}>{statusCounts.delivered}</p></Card>
        <Card className="p-4"><p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>Collected</p><p className="text-2xl" style={{ color: '#166534', fontWeight: 700 }}>{statusCounts.collected}</p></Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label style={{ color: '#2E2E2E', fontWeight: 600 }}>Filter by Status:</label>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as OrderStatus)}>
            <SelectTrigger className="w-48" style={{ borderColor: '#A5D6A7' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
              <SelectItem value="paid">Paid ({statusCounts.paid})</SelectItem>
              <SelectItem value="delivered">Delivered ({statusCounts.delivered})</SelectItem>
              <SelectItem value="collected">Collected ({statusCounts.collected})</SelectItem>
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

                <Select value={order.status} onValueChange={(value) => void handleUpdateStatus(order.orderId, value as any)}>
                  <SelectTrigger className="w-40" style={{ borderColor: '#2E7D32' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="collected">Collected</SelectItem>
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
