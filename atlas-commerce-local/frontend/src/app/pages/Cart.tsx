import { Link, useNavigate } from 'react-router';
import { Minus, Plus, Trash2, ShoppingBag, LoaderCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

export function Cart() {
  const { cart, isLoading, error, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const total = getCartTotal();

  const handleRemoveFromCart = async (productName: string, productId: string) => {
    try {
      await removeFromCart(productId);
      toast.success(`${productName} removed from cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update cart');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
        <div className="container mx-auto px-4 text-center py-16" style={{ color: '#6B6B6B' }}>
          <LoaderCircle className="h-10 w-10 mx-auto mb-4 animate-spin" />
          Loading cart...
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <ShoppingBag
              className="h-24 w-24 mx-auto mb-6"
              style={{ color: '#A5D6A7' }}
            />
            <h2 className="mb-4" style={{ color: '#2E2E2E' }}>
              Your Cart is Empty
            </h2>
            <p className="mb-8 text-lg" style={{ color: '#6B6B6B' }}>
              Add some fresh produce to get started!
            </p>
            <Link to="/shop">
              <Button size="lg" style={{ backgroundColor: '#2E7D32' }}>
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="container mx-auto px-4">
        <h1 className="mb-8" style={{ color: '#2E2E2E' }}>
          Shopping Cart
        </h1>

        {error && (
          <Card className="p-4 mb-6" style={{ borderLeft: '4px solid #FF9800', backgroundColor: '#FFF9E6' }}>
            <p style={{ color: '#2E2E2E', fontWeight: 600 }}>Cart connection issue</p>
            <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
                          {item.category}
                        </p>
                        <h3 className="text-lg" style={{ color: '#2E2E2E' }}>
                          {item.name}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleRemoveFromCart(item.name, item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                          style={{ borderColor: '#2E7D32' }}
                        >
                          <Minus className="h-4 w-4" style={{ color: '#2E7D32' }} />
                        </Button>
                        <span className="w-12 text-center" style={{ color: '#2E2E2E' }}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                          style={{ borderColor: '#2E7D32' }}
                        >
                          <Plus className="h-4 w-4" style={{ color: '#2E7D32' }} />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg" style={{ color: '#2E7D32', fontWeight: 600 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs" style={{ color: '#6B6B6B' }}>
                          ${item.price.toFixed(2)} / {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="mb-6" style={{ color: '#2E2E2E' }}>
                Order Summary
              </h3>

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
                className="w-full mb-3"
                size="lg"
                style={{ backgroundColor: '#2E7D32' }}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              <Link to="/shop">
                <Button
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
                >
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
