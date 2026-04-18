import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router';
import { Clock3, Lock, CreditCard, MapPin, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { placeOrder } from '../lib/api';
import { toast } from 'sonner';

const COLLECTION_WINDOWS = [
  'Tomorrow, 09:00 to 12:00',
  'Tomorrow, 12:00 to 15:00',
  'Tomorrow, 15:00 to 18:00',
  'Saturday, 09:00 to 12:00',
];

const DELIVERY_WINDOWS = [
  'Tomorrow evening, 18:00 to 21:00',
  'Next weekday, 09:00 to 13:00',
  'Next weekday, 13:00 to 17:00',
  'Saturday route, 10:00 to 14:00',
];

export function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const total = getCartTotal();

  const [checkoutInfo, setCheckoutInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    fulfillmentMethod: 'collection' as 'collection' | 'delivery',
    requestedWindow: COLLECTION_WINDOWS[0],
    customerNote: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const defaultAddress = user?.addresses.find((address) => address.isDefault) || user?.addresses[0];
    setCheckoutInfo((prev) => ({
      ...prev,
      fullName: user?.name || '',
      address: defaultAddress?.address || '',
      city: defaultAddress?.city || '',
      postcode: defaultAddress?.postcode || '',
      country: defaultAddress?.country || 'United Kingdom',
    }));
  }, [user]);

  const availableWindows = useMemo(
    () => (checkoutInfo.fulfillmentMethod === 'delivery' ? DELIVERY_WINDOWS : COLLECTION_WINDOWS),
    [checkoutInfo.fulfillmentMethod],
  );

  if (isLoading) {
    return <div className="p-6" style={{ color: '#6B6B6B' }}>Loading checkout...</div>;
  }

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setCheckoutInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFulfillmentChange = (value: 'collection' | 'delivery') => {
    const windows = value === 'delivery' ? DELIVERY_WINDOWS : COLLECTION_WINDOWS;
    setCheckoutInfo((prev) => ({
      ...prev,
      fulfillmentMethod: value,
      requestedWindow: windows[0],
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkoutInfo.fullName || !checkoutInfo.address || !checkoutInfo.city || !checkoutInfo.postcode) {
      toast.error('Please fill in the customer and address details');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await placeOrder(checkoutInfo);
      await clearCart();
      await refreshUser();

      toast.success(`Order ${order.orderNumber} placed successfully`, {
        description: `Stored as ${order.fulfillmentMethod} with the selected time window.`,
        duration: 4000,
      });

      navigate('/account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 mb-4 transition-colors hover:underline"
            style={{ color: '#2E7D32' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 style={{ color: '#2E2E2E' }}>Checkout</h1>

          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: '#A5D6A7' }}>
            <Lock className="h-5 w-5" style={{ color: '#2E7D32' }} />
            <div>
              <p className="text-sm" style={{ color: '#2E2E2E', fontWeight: 600 }}>
                Backend checkout connected
              </p>
              <p className="text-xs" style={{ color: '#2E2E2E' }}>
                Orders now store fulfilment method, requested slot, and customer notes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                    <Truck className="h-5 w-5" style={{ color: '#2E7D32' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#2E2E2E' }}>Fulfilment</h3>
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>Choose collection or delivery and request a preferred time window.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleFulfillmentChange('collection')}
                    className="rounded-lg border p-4 text-left transition-colors"
                    style={{
                      borderColor: checkoutInfo.fulfillmentMethod === 'collection' ? '#2E7D32' : '#D9D9D9',
                      backgroundColor: checkoutInfo.fulfillmentMethod === 'collection' ? '#F0FFF4' : '#FFFFFF',
                    }}
                  >
                    <p style={{ color: '#2E2E2E', fontWeight: 600 }}>Collection</p>
                    <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>Pickup from the GLH hub point during your selected slot.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFulfillmentChange('delivery')}
                    className="rounded-lg border p-4 text-left transition-colors"
                    style={{
                      borderColor: checkoutInfo.fulfillmentMethod === 'delivery' ? '#2E7D32' : '#D9D9D9',
                      backgroundColor: checkoutInfo.fulfillmentMethod === 'delivery' ? '#F0FFF4' : '#FFFFFF',
                    }}
                  >
                    <p style={{ color: '#2E2E2E', fontWeight: 600 }}>Delivery</p>
                    <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>Local route drop-off to the saved customer address.</p>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedWindow">Preferred time window</Label>
                  <Select value={checkoutInfo.requestedWindow} onValueChange={(value) => handleInputChange('requestedWindow', value)}>
                    <SelectTrigger id="requestedWindow" style={{ borderColor: '#A5D6A7' }}>
                      <SelectValue placeholder="Choose a time window" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWindows.map((window) => (
                        <SelectItem key={window} value={window}>{window}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                    <MapPin className="h-5 w-5" style={{ color: '#2E7D32' }} />
                  </div>
                  <h3 style={{ color: '#2E2E2E' }}>Customer Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={checkoutInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="John Smith"
                      required
                      style={{ borderColor: '#A5D6A7' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={checkoutInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Green Street"
                      required
                      style={{ borderColor: '#A5D6A7' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={checkoutInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Manchester"
                        required
                        style={{ borderColor: '#A5D6A7' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={checkoutInfo.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="M1 1AE"
                        required
                        style={{ borderColor: '#A5D6A7' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={checkoutInfo.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger style={{ borderColor: '#A5D6A7' }}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Ireland">Ireland</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerNote">Order note</Label>
                    <Textarea
                      id="customerNote"
                      value={checkoutInfo.customerNote}
                      onChange={(e) => handleInputChange('customerNote', e.target.value)}
                      placeholder="Add delivery guidance, collection requests, or allergy notes"
                      className="min-h-24"
                      style={{ borderColor: '#A5D6A7' }}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                    <CreditCard className="h-5 w-5" style={{ color: '#2E7D32' }} />
                  </div>
                  <h3 style={{ color: '#2E2E2E' }}>Payment Method</h3>
                </div>

                {user?.paymentMethods.length ? (
                  <div className="space-y-2">
                    {user.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        style={{ borderColor: '#A5D6A7' }}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" style={{ color: '#2E7D32' }} />
                          <div>
                            <p style={{ color: '#2E2E2E' }}>
                              {method.brand} •••• {method.last4}
                            </p>
                            <p className="text-sm" style={{ color: '#6B6B6B' }}>
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#2E7D32', color: 'white' }}>
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF9E6', borderLeft: '4px solid #FFC107' }}>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>
                      No saved card on file. This prototype still records the order in demo payment mode.
                    </p>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#A5D6A7' }}>
                    <ShoppingBag className="h-5 w-5" style={{ color: '#2E7D32' }} />
                  </div>
                  <h3 style={{ color: '#2E2E2E' }}>Order Summary</h3>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#2E2E2E' }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: '#6B6B6B' }}>
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm" style={{ color: '#2E2E2E' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B6B6B' }}>Subtotal</span>
                    <span style={{ color: '#2E2E2E' }}>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6B6B6B' }}>Fulfilment</span>
                    <span style={{ color: '#2E7D32', textTransform: 'capitalize' }}>{checkoutInfo.fulfillmentMethod}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span style={{ color: '#6B6B6B' }}>Requested slot</span>
                    <span className="text-right text-sm" style={{ color: '#2E2E2E' }}>{checkoutInfo.requestedWindow}</span>
                  </div>
                  <div className="border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-lg" style={{ color: '#2E2E2E', fontWeight: 600 }}>
                        Total
                      </span>
                      <span className="text-2xl" style={{ color: '#2E7D32', fontWeight: 700 }}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mb-3"
                  size="lg"
                  disabled={isProcessing}
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  {isProcessing ? (
                    <>
                      <Lock className="h-4 w-4 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Place Secure Order
                    </>
                  )}
                </Button>

                <div className="text-center p-3 rounded" style={{ backgroundColor: '#FAFAF5' }}>
                  <p className="text-xs" style={{ color: '#6B6B6B' }}>
                    Demo payment, real order record with slot tracking
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9E6' }}>
                  <div className="flex items-start gap-2">
                    <Clock3 className="h-4 w-4 mt-0.5" style={{ color: '#B7791F' }} />
                    <p className="text-xs" style={{ color: '#6B6B6B' }}>
                      Collection orders are marked for hub pickup. Delivery orders use the saved address and note.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
