import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  Address,
  Order,
  PaymentMethod,
  Profile,
  createAddress,
  createPaymentMethod,
  deleteAddress as deleteAddressRequest,
  deletePaymentMethod as deletePaymentMethodRequest,
  getAddresses,
  getCurrentUser,
  getOrderDetail,
  getOrders,
  getPaymentMethods,
  getProfile,
  loginAdmin as loginAdminRequest,
  loginCustomer,
  logoutUser,
  updateAddress as updateAddressRequest,
  updateProfileName,
} from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'staff';
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  orderHistory: Order[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(profile: Profile, addresses: Address[], paymentMethods: PaymentMethod[], orderHistory: Order[]): User {
  return {
    id: String(profile.id),
    name: profile.name,
    email: profile.email,
    role: profile.role,
    addresses,
    paymentMethods,
    orderHistory,
    createdAt: profile.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = async (profileOverride?: Profile | null) => {
    const baseProfile = profileOverride ?? (await getCurrentUser());
    if (!baseProfile) {
      setUser(null);
      return;
    }

    const profile = await getProfile().catch(() => baseProfile);

    if (profile.role === 'customer') {
      const [addresses, paymentMethods, orders] = await Promise.all([
        getAddresses(),
        getPaymentMethods(),
        getOrders(),
      ]);

      const orderHistory = await Promise.all(
        orders.map(async (order) => {
          try {
            return await getOrderDetail(order.id);
          } catch {
            return order;
          }
        }),
      );

      setUser(toUser(profile, addresses, paymentMethods, orderHistory));
      return;
    }

    setUser(toUser(profile, [], [], []));
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        await hydrate();
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const profile = await loginCustomer(email, password);
      await hydrate(profile);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const profile = await loginAdminRequest(email, password);
      await hydrate(profile);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await logoutUser();
    } catch {
      // keep local logout even if backend cleanup fails
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await hydrate();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    if (updates.name && updates.name !== user.name) {
      await updateProfileName(updates.name);
    }
    await refreshUser();
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    await createAddress(address);
    await refreshUser();
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    const existing = user?.addresses.find((address) => address.id === id);
    if (!existing) return;
    await updateAddressRequest(id, {
      ...existing,
      ...updates,
    });
    await refreshUser();
  };

  const deleteAddress = async (id: string) => {
    await deleteAddressRequest(id);
    await refreshUser();
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    await createPaymentMethod({
      brand: method.brand,
      last4: method.last4,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault,
    });
    await refreshUser();
  };

  const deletePaymentMethod = async (id: string) => {
    await deletePaymentMethodRequest(id);
    await refreshUser();
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      adminLogin,
      logout,
      refreshUser,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      addPaymentMethod,
      deletePaymentMethod,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
