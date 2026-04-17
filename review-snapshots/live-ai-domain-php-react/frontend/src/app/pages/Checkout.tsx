import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router';
import { Lock, CreditCard, MapPin, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { placeOrder } from '../lib/api';
import { toast } from 'sonner';

export function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const total = getCartTotal();

  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const defaultAddress = user?.addresses.find((address) => address.isDefault) || user?.addresses[0];
    setBillingInfo({
      fullName: user?.name || '',
      address: defaultAddress?.address || '',
      city: defaultAddress?.city || '',
      postcode: defaultAddress?.postcode || '',
      country: defaultAddress?.country || 'United Kingdom',
    });
  }, [user]);

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
    setBillingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billingInfo.fullName || !billingInfo.address || !billingInfo.city || !billingInfo.postcode) {
      toast.error('Please fill in all billing details');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await placeOrder(billingInfo);
      await clearCart();
      await refreshUser();

      toast.success(`Order ${order.orderNumber} placed successfully`, {
        description: 'The backend created and stored your order.',
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
                Orders are now stored through the live API.
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
                    <MapPin className="h-5 w-5" style={{ color: '#2E7D32' }} />
                  </div>
                  <h3 style={{ color: '#2E2E2E' }}>Billing Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={billingInfo.fullName}
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
                      value={billingInfo.address}
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
                        value={billingInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Springfield"
                        required
                        style={{ borderColor: '#A5D6A7' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={billingInfo.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="SP1 2AB"
                        required
                        style={{ borderColor: '#A5D6A7' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={billingInfo.country}
                      onValueChange={(value) => handleInputChange('country', value)}
                    >
                      <SelectTrigger style={{ borderColor: '#A5D6A7' }}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Ireland">Ireland</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Spain">Spain</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <span style={{ color: '#6B6B6B' }}>Delivery</span>
                    <span style={{ color: '#2E7D32' }}>Free</span>
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
                    Demo payment, real order record
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
