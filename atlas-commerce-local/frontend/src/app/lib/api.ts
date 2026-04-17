export type UserRole = 'customer' | 'admin' | 'staff';

export interface StoreProduct {
  id: string;
  productId: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  inStock: boolean;
  stockLevel: number;
  lowStockThreshold: number;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Address {
  id: string;
  fullName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  paymentStatus?: string;
  items: OrderItem[];
}

export interface CartItem extends StoreProduct {
  quantity: number;
}

export interface CartSnapshot {
  items: CartItem[];
  subtotal: number;
  total: number;
  count: number;
}

export interface AdminOverview {
  products: number;
  customers: number;
  orders: number;
  revenue: number;
}

export interface AdminInventoryItem {
  id: string;
  productId: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  stockLevel: number;
  lowStockThreshold: number;
}

export interface AdminOrder {
  id: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export interface AdminCustomer {
  id: string;
  customerId: number;
  name: string;
  email: string;
  orderCount: number;
  totalSpend: number;
  avgOrderValue: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AdminAnalytics {
  revenueByStatus: Array<{
    status: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

interface ApiEnvelope<T> {
  ok: boolean;
  message: string;
  data?: T;
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)
  || (window.location.port === '5173' ? 'http://127.0.0.1:8000/api' : `${window.location.origin}/api`);

async function requestData<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & Record<string, any>;

  if (!response.ok || payload?.ok === false) {
    throw new Error((payload?.message as string) || 'Request failed');
  }

  return (payload.data as T) ?? (payload as T);
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function toLoyaltyTier(totalSpend: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (totalSpend >= 400) return 'platinum';
  if (totalSpend >= 250) return 'gold';
  if (totalSpend >= 120) return 'silver';
  return 'bronze';
}

function mapRole(raw: any): UserRole {
  if (raw?.role === 'admin' || raw?.is_staff) return 'admin';
  return 'customer';
}

function mapProfile(raw: any): Profile {
  return {
    id: asNumber(raw.id),
    name: raw.name,
    email: raw.email,
    role: mapRole(raw),
    createdAt: raw.created_at,
  };
}

export function mapStoreProduct(raw: any): StoreProduct {
  const stockLevel = asNumber(raw.available_stock);
  return {
    id: String(raw.id),
    productId: asNumber(raw.id),
    name: raw.name,
    category: raw.category?.name || 'General',
    price: asNumber(raw.price),
    unit: 'each',
    image: raw.image_url || 'https://placehold.co/600x600?text=Product',
    description: raw.description || raw.summary || '',
    inStock: Boolean(raw.in_stock),
    stockLevel,
    lowStockThreshold: 5,
  };
}

function mapAddress(raw: any): Address {
  return {
    id: String(raw.id),
    fullName: raw.full_name,
    address: raw.address,
    city: raw.city,
    postcode: raw.postcode,
    country: raw.country,
    isDefault: Boolean(raw.is_default),
  };
}

function mapPaymentMethod(raw: any): PaymentMethod {
  return {
    id: String(raw.id),
    type: 'card',
    last4: raw.last4,
    brand: raw.brand,
    expiryMonth: String(raw.expiry_month),
    expiryYear: String(raw.expiry_year),
    isDefault: Boolean(raw.is_default),
  };
}

function mapOrderItem(raw: any): OrderItem {
  return {
    productId: raw.product_id != null ? String(raw.product_id) : undefined,
    productName: raw.product_name || raw.productName,
    quantity: asNumber(raw.quantity),
    price: asNumber(raw.unit_price ?? raw.price),
  };
}

function mapOrder(raw: any): Order {
  return {
    id: String(raw.id),
    orderNumber: raw.order_number || `ORD-${raw.id}`,
    date: raw.created_at,
    total: asNumber(raw.total),
    status: raw.status,
    paymentStatus: raw.status,
    items: Array.isArray(raw.items) ? raw.items.map(mapOrderItem) : [],
  };
}

function mapCartItem(raw: any): CartItem {
  const product = raw.product || {};
  return {
    id: String(raw.id),
    productId: asNumber(product.id),
    name: product.name,
    category: product.category?.name || 'General',
    price: asNumber(product.price),
    unit: 'each',
    image: product.image_url || 'https://placehold.co/600x600?text=Product',
    description: product.description || product.summary || '',
    inStock: Boolean(product.in_stock),
    stockLevel: asNumber(product.available_stock),
    lowStockThreshold: 5,
    quantity: asNumber(raw.quantity),
  };
}

export async function getProducts(): Promise<StoreProduct[]> {
  const response = await requestData<{ products: any[] }>('/products/');
  return response.products.map(mapStoreProduct);
}

export async function getCurrentUser(): Promise<Profile | null> {
  const response = await requestData<{ authenticated: boolean; user: any | null }>('/users/me/');
  if (!response.authenticated || !response.user) {
    return null;
  }
  return mapProfile(response.user);
}

export async function loginCustomer(email: string, password: string): Promise<Profile> {
  const response = await requestData<{ authenticated: boolean; user: any }>('/users/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return mapProfile(response.user);
}

export async function loginAdmin(email: string, password: string): Promise<Profile> {
  const profile = await loginCustomer(email, password);
  if (profile.role !== 'admin') {
    throw new Error('This account does not have admin access');
  }
  return profile;
}

export async function logoutUser(): Promise<void> {
  await requestData('/users/logout/', { method: 'POST' });
}

export async function getProfile(): Promise<Profile> {
  const response = await requestData<{ profile: any }>('/users/profile/');
  return mapProfile(response.profile);
}

export async function updateProfileName(name: string): Promise<void> {
  await requestData('/users/profile/', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function getAddresses(): Promise<Address[]> {
  const response = await requestData<{ addresses: any[] }>('/users/addresses/');
  return response.addresses.map(mapAddress);
}

export async function createAddress(address: Omit<Address, 'id'>): Promise<void> {
  await requestData('/users/addresses/', {
    method: 'POST',
    body: JSON.stringify({
      full_name: address.fullName,
      address: address.address,
      city: address.city,
      postcode: address.postcode,
      country: address.country,
      is_default: address.isDefault,
    }),
  });
}

export async function updateAddress(addressId: string, address: Omit<Address, 'id'>): Promise<void> {
  await requestData(`/users/addresses/${addressId}/`, {
    method: 'PATCH',
    body: JSON.stringify({
      full_name: address.fullName,
      address: address.address,
      city: address.city,
      postcode: address.postcode,
      country: address.country,
      is_default: address.isDefault,
    }),
  });
}

export async function deleteAddress(addressId: string): Promise<void> {
  await requestData(`/users/addresses/${addressId}/`, {
    method: 'DELETE',
  });
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await requestData<{ payment_methods: any[] }>('/users/payment-methods/');
  return response.payment_methods.map(mapPaymentMethod);
}

export async function createPaymentMethod(method: Omit<PaymentMethod, 'id' | 'type'>): Promise<void> {
  await requestData('/users/payment-methods/', {
    method: 'POST',
    body: JSON.stringify({
      brand: method.brand,
      last4: method.last4,
      expiry_month: Number(method.expiryMonth),
      expiry_year: Number(method.expiryYear),
      is_default: method.isDefault,
    }),
  });
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  await requestData(`/users/payment-methods/${paymentMethodId}/`, {
    method: 'DELETE',
  });
}

export async function getOrders(): Promise<Order[]> {
  const response = await requestData<{ orders: any[] }>('/orders/');
  return response.orders.map(mapOrder);
}

export async function getOrderDetail(orderId: string): Promise<Order> {
  const response = await requestData<{ order: any }>(`/orders/${orderId}/`);
  return mapOrder(response.order);
}

export async function getCart(): Promise<CartSnapshot> {
  const response = await requestData<{ cart: any }>('/cart/');
  const cart = response.cart;
  const items: CartItem[] = Array.isArray(cart?.items) ? cart.items.map(mapCartItem) : [];

  return {
    items,
    subtotal: asNumber(cart?.subtotal),
    total: asNumber(cart?.total),
    count: asNumber(cart?.total_items),
  };
}

export async function addCartItem(productId: number, quantity = 1): Promise<void> {
  await requestData('/cart/items/', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItem(itemId: number, quantity: number): Promise<void> {
  await requestData(`/cart/items/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: number): Promise<void> {
  await requestData(`/cart/items/${itemId}/`, {
    method: 'DELETE',
  });
}

export async function clearCartItems(): Promise<void> {
  await requestData('/cart/', { method: 'DELETE' });
}

export async function previewCheckout(): Promise<{ items: CartItem[]; total: number }> {
  const [cart, summary] = await Promise.all([
    getCart(),
    requestData<{ summary: { total: number } }>('/orders/checkout/preview/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  ]);

  return {
    items: cart.items,
    total: asNumber(summary.summary.total),
  };
}

export async function placeOrder(payload: {
  fullName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}): Promise<Order> {
  const response = await requestData<{ order: any }>('/orders/checkout/place/', {
    method: 'POST',
    body: JSON.stringify({
      full_name: payload.fullName,
      address: payload.address,
      city: payload.city,
      postcode: payload.postcode,
      country: payload.country,
    }),
  });
  return mapOrder(response.order);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const response = await requestData<{ overview: any }>('/dashboard/admin/overview/');
  return {
    products: asNumber(response.overview.products),
    customers: asNumber(response.overview.customers),
    orders: asNumber(response.overview.orders),
    revenue: asNumber(response.overview.revenue),
  };
}

export async function getAdminInventory(): Promise<AdminInventoryItem[]> {
  const response = await requestData<{ inventory: any[] }>('/dashboard/admin/inventory/');
  return response.inventory.map((item) => ({
    id: String(item.id),
    productId: asNumber(item.productId),
    name: item.name,
    category: item.category,
    price: asNumber(item.price),
    unit: item.unit,
    stockLevel: asNumber(item.stockLevel),
    lowStockThreshold: asNumber(item.lowStockThreshold),
  }));
}

export async function updateAdminInventory(productId: number, stockLevel: number, lowStockThreshold: number): Promise<void> {
  await requestData(`/dashboard/admin/inventory/${productId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ stockLevel, lowStockThreshold }),
  });
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await requestData<{ orders: any[] }>('/dashboard/admin/orders/');
  return response.orders.map((order) => ({
    id: String(order.id),
    orderId: asNumber(order.orderId),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    date: order.date,
    total: asNumber(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));
}

export async function updateAdminOrderStatus(orderId: number, status: string): Promise<void> {
  await requestData(`/dashboard/admin/orders/${orderId}/status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const response = await requestData<{ customers: any[] }>('/dashboard/admin/customers/');
  return response.customers.map((customer) => {
    const totalSpend = asNumber(customer.totalSpend);
    const orderCount = asNumber(customer.orderCount);
    return {
      id: String(customer.id),
      customerId: asNumber(customer.id),
      name: customer.name,
      email: customer.email,
      orderCount,
      totalSpend,
      avgOrderValue: asNumber(customer.avgOrderValue),
      loyaltyTier: toLoyaltyTier(totalSpend),
    };
  });
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const response = await requestData<{ analytics: any }>('/dashboard/admin/analytics/');
  return {
    revenueByStatus: (response.analytics.revenueByStatus || []).map((row: any) => ({
      status: row.status,
      orders: asNumber(row.orders),
      revenue: asNumber(row.revenue),
    })),
    topProducts: (response.analytics.topProducts || []).map((row: any) => ({
      productName: row.productName,
      totalSold: asNumber(row.totalSold),
      revenue: asNumber(row.revenue),
    })),
  };
}
