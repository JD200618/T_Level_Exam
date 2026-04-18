import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  CartItem,
  StoreProduct,
  addCartItem,
  clearCartItems,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../lib/api';

interface CartContextType {
  cart: CartItem[];
  isLoading: boolean;
  error: string;
  addToCart: (product: StoreProduct) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const refreshCart = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getCart();
      setCart(snapshot.items);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load cart.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, [user?.id]);

  const addToCart = async (product: StoreProduct) => {
    await addCartItem(product.productId, 1);
    await refreshCart();
  };

  const removeFromCartAction = async (productId: string) => {
    await removeCartItem(Number(productId));
    await refreshCart();
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCartAction(productId);
      return;
    }
    await updateCartItem(Number(productId), quantity);
    await refreshCart();
  };

  const clearCart = async () => {
    await clearCartItems();
    await refreshCart();
  };

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      isLoading,
      error,
      addToCart,
      removeFromCart: removeFromCartAction,
      updateQuantity,
      clearCart,
      refreshCart,
      getCartTotal: () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
      getCartCount: () => cart.reduce((count, item) => count + item.quantity, 0),
    }),
    [cart, isLoading, error],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
