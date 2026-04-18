import { Navigate, useNavigate } from 'react-router';
import { User, MapPin, CreditCard, Package, Settings, LogOut, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function Account() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshUser,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
  } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-6" style={{ color: '#6B6B6B' }}>Loading account...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleRefresh = async () => {
    await refreshUser();
    toast.success('Account refreshed from backend');
  };

  const handleAddAddress = async () => {
    const fullName = window.prompt('Full name', user.name) || user.name;
    const address = window.prompt('Address line', '456 Market Lane');
    const city = window.prompt('City', 'Springfield');
    const postcode = window.prompt('Postcode', 'SP3 4EF');
    const country = window.prompt('Country', 'United Kingdom');

    if (!address || !city || !postcode || !country) {
      return;
    }

    try {
      await addAddress({
        fullName,
        address,
        city,
        postcode,
        country,
        isDefault: user.addresses.length === 0,
      });
      toast.success('Address added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add address');
    }
  };

  const handleAddCard = async () => {
    const brand = window.prompt('Card brand', 'Visa') || 'Visa';
    const last4 = window.prompt('Last 4 digits', '4242') || '4242';
    const expiryMonth = window.prompt('Expiry month', '12') || '12';
    const expiryYear = window.prompt('Expiry year', '2027') || '2027';

    try {
      await addPaymentMethod({
        type: 'card',
        brand,
        last4,
        expiryMonth,
        expiryYear,
        isDefault: user.paymentMethods.length === 0,
      });
      toast.success('Payment method added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add payment method');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return { backgroundColor: '#2E7D32', color: 'white' };
      case 'paid':
      case 'collected':
        return { backgroundColor: '#A5D6A7', color: '#2E2E2E' };
      case 'pending':
        return { backgroundColor: '#FFC107', color: '#2E2E2E' };
      default:
        return { backgroundColor: '#6B6B6B', color: 'white' };
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
                My Account
              </h1>
              <p style={{ color: '#6B6B6B' }}>
                Live account data from the backend
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => void handleRefresh()}
                style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleLogout()}
                style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-6" style={{ color: '#2E2E2E' }}>
                Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#6B6B6B' }}>Full Name</p>
                  <p className="text-lg" style={{ color: '#2E2E2E' }}>{user.name}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#6B6B6B' }}>Email Address</p>
                  <p className="text-lg" style={{ color: '#2E2E2E' }}>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#6B6B6B' }}>Role</p>
                  <p className="text-lg capitalize" style={{ color: '#2E2E2E' }}>{user.role}</p>
                </div>
                {user.createdAt && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#6B6B6B' }}>Member Since</p>
                    <p className="text-lg" style={{ color: '#2E2E2E' }}>{formatDate(user.createdAt)}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#2E2E2E' }}>Order History</h3>
              <p style={{ color: '#6B6B6B' }}>{user.orderHistory.length} orders</p>
            </div>

            {user.orderHistory.length === 0 ? (
              <Card className="p-6" style={{ color: '#6B6B6B' }}>
                No orders yet. Place one from the shop to populate this tab.
              </Card>
            ) : (
              <div className="space-y-4">
                {user.orderHistory.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 style={{ color: '#2E2E2E' }}>Order #{order.orderNumber}</h4>
                          <Badge style={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge variant="outline" style={{ borderColor: '#2E7D32', color: '#2E7D32' }}>
                            {order.fulfillmentMethod}
                          </Badge>
                        </div>
                        <p className="text-sm" style={{ color: '#6B6B6B' }}>
                          {formatDate(order.date)}
                        </p>
                        {order.requestedWindow && (
                          <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
                            Requested slot: {order.requestedWindow}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm mb-1" style={{ color: '#6B6B6B' }}>Total</p>
                        <p className="text-xl" style={{ color: '#2E7D32', fontWeight: 600 }}>
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      {order.items.length ? (
                        order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <p style={{ color: '#2E2E2E' }}>
                              {item.productName} <span style={{ color: '#6B6B6B' }}>×{item.quantity}</span>
                            </p>
                            <p style={{ color: '#6B6B6B' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#6B6B6B' }}>No line items available for this order.</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#2E2E2E' }}>Saved Addresses</h3>
              <Button
                size="sm"
                style={{ backgroundColor: '#2E7D32' }}
                onClick={() => void handleAddAddress()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((address) => (
                <Card key={address.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {address.isDefault && (
                        <Badge className="mb-2" style={{ backgroundColor: '#2E7D32' }}>
                          Default
                        </Badge>
                      )}
                      <h4 style={{ color: '#2E2E2E' }}>{address.fullName}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => void deleteAddress(address.id).then(() => toast.success('Address deleted')).catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to delete address'))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1" style={{ color: '#6B6B6B' }}>
                    <p>{address.address}</p>
                    <p>{address.city}</p>
                    <p>{address.postcode}</p>
                    <p>{address.country}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#2E2E2E' }}>Payment Methods</h3>
              <Button
                size="sm"
                style={{ backgroundColor: '#2E7D32' }}
                onClick={() => void handleAddCard()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.paymentMethods.map((method) => (
                <Card key={method.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {method.isDefault && (
                        <Badge className="mb-2" style={{ backgroundColor: '#2E7D32' }}>
                          Default
                        </Badge>
                      )}
                      <h4 style={{ color: '#2E2E2E' }}>{method.brand} •••• {method.last4}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => void deletePaymentMethod(method.id).then(() => toast.success('Payment method deleted')).catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to delete payment method'))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div style={{ color: '#6B6B6B' }}>
                    <p>Expires {method.expiryMonth}/{method.expiryYear}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-6" style={{ color: '#2E2E2E' }}>
                Prototype Notes
              </h3>

              <div className="space-y-4" style={{ color: '#6B6B6B' }}>
                <p>This account page is now backed by the API for profile, addresses, cards, and order history.</p>
                <p>Payments remain demo-recorded, but the order itself is created for real in the database.</p>
                <p>Inventory, orders, customer stats, and analytics are visible from the admin dashboard.</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
