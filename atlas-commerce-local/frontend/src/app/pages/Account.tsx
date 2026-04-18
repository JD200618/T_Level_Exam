import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { User, MapPin, CreditCard, Package, Settings, LogOut, Plus, Trash2, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const EMPTY_ADDRESS_FORM = {
  fullName: '',
  address: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
  isDefault: false,
};

const EMPTY_CARD_FORM = {
  brand: 'Visa',
  last4: '',
  expiryMonth: '',
  expiryYear: '',
  isDefault: false,
};

export function Account() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshUser,
    updateProfile,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
  } = useAuth();
  const navigate = useNavigate();

  const [profileName, setProfileName] = useState('');
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name);
    setAddressForm((prev) => ({
      ...prev,
      fullName: user.name,
      isDefault: user.addresses.length === 0,
    }));
    setCardForm((prev) => ({
      ...prev,
      isDefault: user.paymentMethods.length === 0,
    }));
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({ name: profileName.trim() });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!addressForm.fullName || !addressForm.address || !addressForm.city || !addressForm.postcode || !addressForm.country) {
      toast.error('Please complete all address fields');
      return;
    }

    setIsSavingAddress(true);
    try {
      await addAddress(addressForm);
      setAddressForm({
        ...EMPTY_ADDRESS_FORM,
        fullName: user.name,
        country: 'United Kingdom',
        isDefault: false,
      });
      toast.success('Address added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCardSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!cardForm.brand || !cardForm.last4 || !cardForm.expiryMonth || !cardForm.expiryYear) {
      toast.error('Please complete all card fields');
      return;
    }

    if (cardForm.last4.length !== 4) {
      toast.error('Card last 4 digits must be exactly 4 numbers');
      return;
    }

    setIsSavingCard(true);
    try {
      await addPaymentMethod({
        type: 'card',
        brand: cardForm.brand,
        last4: cardForm.last4,
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        isDefault: cardForm.isDefault,
      });
      setCardForm({
        ...EMPTY_CARD_FORM,
        brand: 'Visa',
        isDefault: false,
      });
      toast.success('Payment method added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add payment method');
    } finally {
      setIsSavingCard(false);
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
                Manage profile details, saved addresses, payment methods, and order history.
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
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h3 style={{ color: '#2E2E2E' }}>Profile Information</h3>
                  <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
                    Update the core customer account details stored through the backend.
                  </p>
                </div>
                <Button onClick={() => void handleSaveProfile()} disabled={isSavingProfile} style={{ backgroundColor: '#2E7D32' }}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingProfile ? 'Saving...' : 'Save profile'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email Address</Label>
                  <Input id="profile-email" value={user.email} disabled style={{ borderColor: '#E5E5E5' }} />
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
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                          £{order.total.toFixed(2)}
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
                              £{(item.price * item.quantity).toFixed(2)}
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
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4" style={{ color: '#2E7D32' }} />
                <h3 style={{ color: '#2E2E2E' }}>Add Address</h3>
              </div>

              <form onSubmit={(event) => void handleAddressSubmit(event)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address-full-name">Full name</Label>
                  <Input
                    id="address-full-name"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address-line">Address</Label>
                  <Input
                    id="address-line"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-city">City</Label>
                  <Input
                    id="address-city"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-postcode">Postcode</Label>
                  <Input
                    id="address-postcode"
                    value={addressForm.postcode}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, postcode: e.target.value }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-country">Country</Label>
                  <Input
                    id="address-country"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.target.value }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={addressForm.isDefault ? 'default' : 'outline'}
                    onClick={() => setAddressForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                    style={addressForm.isDefault ? { backgroundColor: '#2E7D32' } : { borderColor: '#2E7D32', color: '#2E7D32' }}
                  >
                    {addressForm.isDefault ? 'Default address' : 'Set as default'}
                  </Button>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSavingAddress} style={{ backgroundColor: '#2E7D32' }}>
                    {isSavingAddress ? 'Saving...' : 'Add address'}
                  </Button>
                </div>
              </form>
            </Card>

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
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4" style={{ color: '#2E7D32' }} />
                <h3 style={{ color: '#2E2E2E' }}>Add Payment Method</h3>
              </div>

              <form onSubmit={(event) => void handleCardSubmit(event)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-brand">Card brand</Label>
                  <Input
                    id="card-brand"
                    value={cardForm.brand}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, brand: e.target.value }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-last4">Last 4 digits</Label>
                  <Input
                    id="card-last4"
                    maxLength={4}
                    value={cardForm.last4}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-expiry-month">Expiry month</Label>
                  <Input
                    id="card-expiry-month"
                    maxLength={2}
                    value={cardForm.expiryMonth}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-expiry-year">Expiry year</Label>
                  <Input
                    id="card-expiry-year"
                    maxLength={4}
                    value={cardForm.expiryYear}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    style={{ borderColor: '#A5D6A7' }}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={cardForm.isDefault ? 'default' : 'outline'}
                    onClick={() => setCardForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                    style={cardForm.isDefault ? { backgroundColor: '#2E7D32' } : { borderColor: '#2E7D32', color: '#2E7D32' }}
                  >
                    {cardForm.isDefault ? 'Default card' : 'Set as default'}
                  </Button>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSavingCard} style={{ backgroundColor: '#2E7D32' }}>
                    {isSavingCard ? 'Saving...' : 'Add payment method'}
                  </Button>
                </div>
              </form>
            </Card>

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
                <p>This account area is backed by the API for profile, addresses, cards, and order history.</p>
                <p>Payments remain demo-recorded, but the order itself is created and stored in the database.</p>
                <p>Inventory, orders, customer stats, and analytics are available in the producer dashboard.</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
