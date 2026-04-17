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

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)
  || (window.location.port === '5173' ? 'http://127.0.0.1:8000/api' : `${window.location.origin}/api`);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || 'Request failed');
  }

  return data as T;
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

export function mapStoreProduct(raw: any): StoreProduct {
  const stockLevel = asNumber(raw.stock_level);
  const lowStockThreshold = asNumber(raw.low_stock_threshold);
  return {
    id: String(raw.id),
    productId: asNumber(raw.id),
    name: raw.name,
    category: raw.category,
    price: asNumber(raw.price),
    unit: raw.unit,
    image: raw.image_url,
    description: raw.description,
    inStock: stockLevel > 0,
    stockLevel,
    lowStockThreshold,
  };
}

function mapAddress(raw: any): Address {
  return {
    id: String(raw.id),
    fullName: raw.full_name,
    address: raw.line1,
    city: raw.city,
    postcode: raw.postcode,
    country: raw.country,
    isDefault: Boolean(asNumber(raw.is_default)),
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
    isDefault: Boolean(asNumber(raw.is_default)),
  };
}

function mapOrderItem(raw: any): OrderItem {
  return {
    productId: raw.product_id != null ? String(raw.product_id) : undefined,
    productName: raw.product_name_snapshot || raw.productName || raw.product_name,
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
    paymentStatus: raw.payment_status,
    items: Array.isArray(raw.items) ? raw.items.map(mapOrderItem) : [],
  };
}

export async function getProducts(): Promise<StoreProduct[]> {
  const response = await request<{ ok: true; products: any[] }>('/products');
  return response.products.map(mapStoreProduct);
}

export async function getCurrentUser(): Promise<Profile | null> {
  const response = await request<{ ok: true; user: any | null }>('/auth/me');
  if (!response.user) {
    return null;
  }
  return {
    id: asNumber(response.user.id),
    name: response.user.name,
    email: response.user.email,
    role: response.user.role,
  };
}

export async function loginCustomer(email: string, password: string): Promise<Profile> {
  const response = await request<{ ok: true; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return {
    id: asNumber(response.user.id),
    name: response.user.name,
    email: response.user.email,
    role: response.user.role,
  };
}

export async function loginAdmin(email: string, password: string): Promise<Profile> {
  const response = await request<{ ok: true; user: any }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return {
    id: asNumber(response.user.id),
    name: response.user.name,
    email: response.user.email,
    role: response.user.role,
  };
}

export async function logoutUser(): Promise<void> {
  await request<{ ok: true }>('/auth/logout', { method: 'POST' });
}

export async function getProfile(): Promise<Profile> {
  const response = await request<{ ok: true; profile: any }>('/account/profile');
  return {
    id: asNumber(response.profile.id),
    name: response.profile.name,
    email: response.profile.email,
    role: response.profile.role,
    createdAt: response.profile.created_at,
  };
}

export async function updateProfileName(name: string): Promise<void> {
  await request<{ ok: true }>('/account/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function getAddresses(): Promise<Address[]> {
  const response = await request<{ ok: true; addresses: any[] }>('/account/addresses');
  return response.addresses.map(mapAddress);
}

export async function createAddress(address: Omit<Address, 'id'>): Promise<void> {
  await request<{ ok: true }>('/account/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function updateAddress(addressId: string, address: Omit<Address, 'id'>): Promise<void> {
  await request<{ ok: true }>(`/account/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify(address),
  });
}

export async function deleteAddress(addressId: string): Promise<void> {
  await request<{ ok: true }>(`/account/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await request<{ ok: true; paymentMethods: any[] }>('/account/payment-methods');
  return response.paymentMethods.map(mapPaymentMethod);
}

export async function createPaymentMethod(method: Omit<PaymentMethod, 'id' | 'type'>): Promise<void> {
  await request<{ ok: true }>('/account/payment-methods', {
    method: 'POST',
    body: JSON.stringify(method),
  });
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  await request<{ ok: true }>(`/account/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
  });
}

export async function getOrders(): Promise<Order[]> {
  const response = await request<{ ok: true; orders: any[] }>('/orders');
  return response.orders.map(mapOrder);
}

export async function getOrderDetail(orderId: string): Promise<Order> {
  const response = await request<{ ok: true; order: any }>(`/orders/${orderId}`);
  return mapOrder(response.order);
}

export async function getCart(): Promise<CartSnapshot> {
  const response = await request<{ ok: true; items: any[]; totals: any }>('/cart');
  const items: CartItem[] = response.items.map((item) => ({
    id: String(item.product_id),
    productId: asNumber(item.product_id),
    name: item.name,
    category: item.category,
    price: asNumber(item.unit_price),
    unit: item.unit,
    image: item.image_url,
    description: item.description,
    inStock: true,
    stockLevel: asNumber(item.stock_level),
    lowStockThreshold: asNumber(item.low_stock_threshold),
    quantity: asNumber(item.quantity),
  }));

  return {
    items,
    subtotal: asNumber(response.totals?.subtotal),
    total: asNumber(response.totals?.total),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function addCartItem(productId: number, quantity = 1): Promise<void> {
  await request<{ ok: true }>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(productId: number, quantity: number): Promise<void> {
  await request<{ ok: true }>(`/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: number): Promise<void> {
  await request<{ ok: true }>(`/cart/items/${productId}`, {
    method: 'DELETE',
  });
}

export async function clearCartItems(): Promise<void> {
  await request<{ ok: true }>('/cart', { method: 'DELETE' });
}

export async function previewCheckout(): Promise<{ items: CartItem[]; total: number }> {
  const response = await request<{ ok: true; items: any[]; totals: any }>('/checkout/preview', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  const items: CartItem[] = response.items.map((item) => ({
    id: String(item.product_id),
    productId: asNumber(item.product_id),
    name: item.name,
    category: item.category,
    price: asNumber(item.unit_price),
    unit: item.unit,
    image: item.image_url,
    description: item.description,
    inStock: true,
    stockLevel: asNumber(item.stock_level),
    lowStockThreshold: asNumber(item.low_stock_threshold),
    quantity: asNumber(item.quantity),
  }));

  return {
    items,
    total: asNumber(response.totals?.total),
  };
}

export async function placeOrder(payload: {
  fullName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}): Promise<Order> {
  const response = await request<{ ok: true; order: any }>('/checkout/place', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    id: String(response.order.orderId),
    orderNumber: response.order.orderNumber,
    date: new Date().toISOString(),
    total: asNumber(response.order.total),
    status: 'paid',
    paymentStatus: 'paid',
    items: [],
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const response = await request<{ ok: true; overview: any }>('/admin/overview');
  return {
    products: asNumber(response.overview.products),
    customers: asNumber(response.overview.customers),
    orders: asNumber(response.overview.orders),
    revenue: asNumber(response.overview.revenue),
  };
}

export async function getAdminInventory(): Promise<AdminInventoryItem[]> {
  const response = await request<{ ok: true; inventory: any[] }>('/admin/inventory');
  return response.inventory.map((item) => ({
    id: String(item.id),
    productId: asNumber(item.id),
    name: item.name,
    category: item.category,
    price: asNumber(item.price),
    unit: item.unit,
    stockLevel: asNumber(item.stock_level),
    lowStockThreshold: asNumber(item.low_stock_threshold),
  }));
}

export async function updateAdminInventory(productId: number, stockLevel: number, lowStockThreshold: number): Promise<void> {
  await request<{ ok: true }>(`/admin/inventory/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ stockLevel, lowStockThreshold }),
  });
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await request<{ ok: true; orders: any[] }>('/admin/orders');
  return response.orders.map((order) => ({
    id: String(order.id),
    orderId: asNumber(order.id),
    orderNumber: order.order_number || `ORD-${order.id}`,
    customerName: order.customer_name || 'Guest',
    customerEmail: order.customer_email || 'guest@local',
    date: order.created_at,
    total: asNumber(order.total),
    status: order.status,
    paymentStatus: order.payment_status,
  }));
}

export async function updateAdminOrderStatus(orderId: number, status: string): Promise<void> {
  await request<{ ok: true }>(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const response = await request<{ ok: true; customers: any[] }>('/admin/customers');
  return response.customers.map((customer) => {
    const totalSpend = asNumber(customer.total_spend);
    const orderCount = asNumber(customer.order_count);
    return {
      id: String(customer.id),
      customerId: asNumber(customer.id),
      name: customer.name,
      email: customer.email,
      orderCount,
      totalSpend,
      avgOrderValue: orderCount > 0 ? totalSpend / orderCount : 0,
      loyaltyTier: toLoyaltyTier(totalSpend),
    };
  });
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const response = await request<{ ok: true; analytics: any }>('/admin/analytics');
  return {
    revenueByStatus: (response.analytics.revenueByStatus || []).map((row: any) => ({
      status: row.status,
      orders: asNumber(row.orders),
      revenue: asNumber(row.revenue),
    })),
    topProducts: (response.analytics.topProducts || []).map((row: any) => ({
      productName: row.product_name,
      totalSold: asNumber(row.units_sold),
      revenue: asNumber(row.revenue),
    })),
  };
}
