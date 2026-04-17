export interface DashboardOrder {
  id: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  date: string;
  total: number;
  status: 'pending' | 'paid' | 'delivered' | 'collected';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export interface CustomerInsight {
  id: string;
  name: string;
  email: string;
  totalSpend: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderDate: string;
  favoriteProducts: string[];
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  weeklyData: {
    week: string;
    units: number;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stockLevel: number;
  lowStockThreshold: number;
  image: string;
  description: string;
}

// Mock Orders Data
export const dashboardOrders: DashboardOrder[] = [
  {
    id: 'ORD-1001',
    customerName: 'Sarah Johnson',
    customerId: '1',
    customerEmail: 'sarah.johnson@example.com',
    date: '2026-03-20',
    total: 28.45,
    status: 'paid',
    items: [
      { productId: '1', productName: 'Organic Tomatoes', quantity: 2, price: 4.99 },
      { productId: '4', productName: 'Fresh Apples', quantity: 3, price: 5.99 },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Michael Chen',
    customerId: '2',
    customerEmail: 'michael.chen@example.com',
    date: '2026-03-19',
    total: 45.32,
    status: 'delivered',
    items: [
      { productId: '5', productName: 'Strawberries', quantity: 4, price: 6.99 },
      { productId: '3', productName: 'Organic Carrots', quantity: 2, price: 3.49 },
      { productId: '8', productName: 'Fresh Broccoli', quantity: 1, price: 3.99 },
    ],
  },
  {
    id: 'ORD-1003',
    customerName: 'Emily Rodriguez',
    customerId: '3',
    customerEmail: 'emily.rodriguez@example.com',
    date: '2026-03-19',
    total: 22.96,
    status: 'paid',
    items: [
      { productId: '2', productName: 'Green Lettuce', quantity: 3, price: 2.99 },
      { productId: '6', productName: 'Fresh Cucumbers', quantity: 4, price: 3.99 },
    ],
  },
  {
    id: 'ORD-1004',
    customerName: 'David Thompson',
    customerId: '4',
    customerEmail: 'david.thompson@example.com',
    date: '2026-03-18',
    total: 31.45,
    status: 'collected',
    items: [
      { productId: '7', productName: 'Bell Peppers', quantity: 5, price: 4.49 },
      { productId: '1', productName: 'Organic Tomatoes', quantity: 2, price: 4.99 },
    ],
  },
  {
    id: 'ORD-1005',
    customerName: 'Lisa Anderson',
    customerId: '5',
    customerEmail: 'lisa.anderson@example.com',
    date: '2026-03-18',
    total: 19.47,
    status: 'delivered',
    items: [
      { productId: '5', productName: 'Strawberries', quantity: 2, price: 6.99 },
      { productId: '2', productName: 'Green Lettuce', quantity: 2, price: 2.99 },
    ],
  },
  {
    id: 'ORD-1006',
    customerName: 'James Wilson',
    customerId: '6',
    customerEmail: 'james.wilson@example.com',
    date: '2026-03-17',
    total: 37.89,
    status: 'delivered',
    items: [
      { productId: '4', productName: 'Fresh Apples', quantity: 4, price: 5.99 },
      { productId: '3', productName: 'Organic Carrots', quantity: 3, price: 3.49 },
    ],
  },
  {
    id: 'ORD-1007',
    customerName: 'Sophia Martinez',
    customerId: '7',
    customerEmail: 'sophia.martinez@example.com',
    date: '2026-03-16',
    total: 28.95,
    status: 'delivered',
    items: [
      { productId: '8', productName: 'Fresh Broccoli', quantity: 4, price: 3.99 },
      { productId: '6', productName: 'Fresh Cucumbers', quantity: 3, price: 3.99 },
    ],
  },
  {
    id: 'ORD-1008',
    customerName: 'Robert Brown',
    customerId: '8',
    customerEmail: 'robert.brown@example.com',
    date: '2026-03-15',
    total: 42.50,
    status: 'delivered',
    items: [
      { productId: '1', productName: 'Organic Tomatoes', quantity: 5, price: 4.99 },
      { productId: '7', productName: 'Bell Peppers', quantity: 4, price: 4.49 },
    ],
  },
  {
    id: 'ORD-1009',
    customerName: 'Maria Garcia',
    customerId: '9',
    customerEmail: 'maria.garcia@example.com',
    date: '2026-03-14',
    total: 35.92,
    status: 'pending',
    items: [
      { productId: '5', productName: 'Strawberries', quantity: 3, price: 6.99 },
      { productId: '4', productName: 'Fresh Apples', quantity: 2, price: 5.99 },
    ],
  },
  {
    id: 'ORD-1010',
    customerName: 'William Taylor',
    customerId: '10',
    customerEmail: 'william.taylor@example.com',
    date: '2026-03-13',
    total: 26.43,
    status: 'delivered',
    items: [
      { productId: '3', productName: 'Organic Carrots', quantity: 4, price: 3.49 },
      { productId: '2', productName: 'Green Lettuce', quantity: 4, price: 2.99 },
    ],
  },
];

// Customer Insights Data
export const customerInsights: CustomerInsight[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    totalSpend: 245.80,
    orderCount: 12,
    avgOrderValue: 20.48,
    lastOrderDate: '2026-03-20',
    favoriteProducts: ['Organic Tomatoes', 'Fresh Apples', 'Strawberries'],
    loyaltyTier: 'gold',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    totalSpend: 412.50,
    orderCount: 18,
    avgOrderValue: 22.92,
    lastOrderDate: '2026-03-19',
    favoriteProducts: ['Strawberries', 'Fresh Broccoli', 'Bell Peppers'],
    loyaltyTier: 'platinum',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    totalSpend: 189.30,
    orderCount: 10,
    avgOrderValue: 18.93,
    lastOrderDate: '2026-03-19',
    favoriteProducts: ['Green Lettuce', 'Fresh Cucumbers', 'Organic Carrots'],
    loyaltyTier: 'silver',
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    totalSpend: 156.75,
    orderCount: 8,
    avgOrderValue: 19.59,
    lastOrderDate: '2026-03-18',
    favoriteProducts: ['Bell Peppers', 'Organic Tomatoes', 'Fresh Apples'],
    loyaltyTier: 'silver',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    totalSpend: 98.25,
    orderCount: 6,
    avgOrderValue: 16.38,
    lastOrderDate: '2026-03-18',
    favoriteProducts: ['Strawberries', 'Green Lettuce'],
    loyaltyTier: 'bronze',
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    totalSpend: 325.40,
    orderCount: 15,
    avgOrderValue: 21.69,
    lastOrderDate: '2026-03-17',
    favoriteProducts: ['Fresh Apples', 'Organic Carrots', 'Fresh Broccoli'],
    loyaltyTier: 'gold',
  },
  {
    id: '7',
    name: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    totalSpend: 212.90,
    orderCount: 11,
    avgOrderValue: 19.35,
    lastOrderDate: '2026-03-16',
    favoriteProducts: ['Fresh Broccoli', 'Fresh Cucumbers', 'Green Lettuce'],
    loyaltyTier: 'gold',
  },
  {
    id: '8',
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    totalSpend: 145.60,
    orderCount: 7,
    avgOrderValue: 20.80,
    lastOrderDate: '2026-03-15',
    favoriteProducts: ['Organic Tomatoes', 'Bell Peppers'],
    loyaltyTier: 'silver',
  },
];

// Product Analytics Data
export const productAnalytics: ProductAnalytics[] = [
  {
    productId: '1',
    productName: 'Organic Tomatoes',
    totalSold: 245,
    revenue: 1223.55,
    weeklyData: [
      { week: 'Week 1', units: 50 },
      { week: 'Week 2', units: 68 },
      { week: 'Week 3', units: 72 },
      { week: 'Week 4', units: 55 },
    ],
  },
  {
    productId: '4',
    productName: 'Fresh Apples',
    totalSold: 312,
    revenue: 1868.88,
    weeklyData: [
      { week: 'Week 1', units: 65 },
      { week: 'Week 2', units: 80 },
      { week: 'Week 3', units: 95 },
      { week: 'Week 4', units: 72 },
    ],
  },
  {
    productId: '5',
    productName: 'Strawberries',
    totalSold: 189,
    revenue: 1321.11,
    weeklyData: [
      { week: 'Week 1', units: 42 },
      { week: 'Week 2', units: 51 },
      { week: 'Week 3', units: 48 },
      { week: 'Week 4', units: 48 },
    ],
  },
  {
    productId: '7',
    productName: 'Bell Peppers',
    totalSold: 156,
    revenue: 700.44,
    weeklyData: [
      { week: 'Week 1', units: 35 },
      { week: 'Week 2', units: 42 },
      { week: 'Week 3', units: 38 },
      { week: 'Week 4', units: 41 },
    ],
  },
  {
    productId: '3',
    productName: 'Organic Carrots',
    totalSold: 198,
    revenue: 691.02,
    weeklyData: [
      { week: 'Week 1', units: 45 },
      { week: 'Week 2', units: 52 },
      { week: 'Week 3', units: 48 },
      { week: 'Week 4', units: 53 },
    ],
  },
  {
    productId: '8',
    productName: 'Fresh Broccoli',
    totalSold: 134,
    revenue: 534.66,
    weeklyData: [
      { week: 'Week 1', units: 28 },
      { week: 'Week 2', units: 35 },
      { week: 'Week 3', units: 38 },
      { week: 'Week 4', units: 33 },
    ],
  },
  {
    productId: '2',
    productName: 'Green Lettuce',
    totalSold: 167,
    revenue: 499.33,
    weeklyData: [
      { week: 'Week 1', units: 38 },
      { week: 'Week 2', units: 45 },
      { week: 'Week 3', units: 42 },
      { week: 'Week 4', units: 42 },
    ],
  },
  {
    productId: '6',
    productName: 'Fresh Cucumbers',
    totalSold: 145,
    revenue: 578.55,
    weeklyData: [
      { week: 'Week 1', units: 32 },
      { week: 'Week 2', units: 38 },
      { week: 'Week 3', units: 40 },
      { week: 'Week 4', units: 35 },
    ],
  },
];

// Inventory Items (with stock levels)
export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    price: 4.99,
    unit: 'lb',
    stockLevel: 45,
    lowStockThreshold: 20,
    image: 'https://images.unsplash.com/photo-1700064165267-8fa68ef07167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB0b21hdG9lcyUyMGZyZXNoJTIwcHJvZHVjZXxlbnwxfHx8fDE3NzM5OTg5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Fresh, vine-ripened organic tomatoes bursting with flavor',
  },
  {
    id: '2',
    name: 'Green Lettuce',
    category: 'Vegetables',
    price: 2.99,
    unit: 'head',
    stockLevel: 12,
    lowStockThreshold: 15,
    image: 'https://images.unsplash.com/photo-1657411658279-e32af8636eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGdyZWVuJTIwbGV0dHVjZXxlbnwxfHx8fDE3NzM5ODIyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Crisp and fresh lettuce, perfect for salads',
  },
  {
    id: '3',
    name: 'Organic Carrots',
    category: 'Vegetables',
    price: 3.49,
    unit: 'lb',
    stockLevel: 62,
    lowStockThreshold: 25,
    image: 'https://images.unsplash.com/photo-1611048660183-dc688cc049f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBjYXJyb3RzJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzM5NTIxNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Sweet and crunchy organic carrots',
  },
  {
    id: '4',
    name: 'Fresh Apples',
    category: 'Fruits',
    price: 5.99,
    unit: 'lb',
    stockLevel: 88,
    lowStockThreshold: 30,
    image: 'https://images.unsplash.com/photo-1623815242959-fb20354f9b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBhcHBsZXMlMjBmcmVzaCUyMGZydWl0fGVufDF8fHx8MTc3Mzg5MjMwOHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Crisp, juicy apples picked fresh from local orchards',
  },
  {
    id: '5',
    name: 'Strawberries',
    category: 'Fruits',
    price: 6.99,
    unit: 'pint',
    stockLevel: 5,
    lowStockThreshold: 10,
    image: 'https://images.unsplash.com/photo-1710528184650-fc75ae862c13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllcyUyMGJlcnJpZXN8ZW58MXx8fHwxNzczOTg5MjQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Sweet, ripe strawberries perfect for snacking',
  },
  {
    id: '6',
    name: 'Fresh Cucumbers',
    category: 'Vegetables',
    price: 3.99,
    unit: 'lb',
    stockLevel: 38,
    lowStockThreshold: 20,
    image: 'https://images.unsplash.com/photo-1725369865895-0dd4566c8864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGN1Y3VtYmVycyUyMGdyZWVuJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzM5MzY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Refreshing cucumbers, great for salads and pickling',
  },
  {
    id: '7',
    name: 'Bell Peppers',
    category: 'Vegetables',
    price: 4.49,
    unit: 'lb',
    stockLevel: 28,
    lowStockThreshold: 20,
    image: 'https://images.unsplash.com/photo-1741515042519-9b52d3ec2eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZWxsb3clMjBiZWxsJTIwcGVwcGVyc3xlbnwxfHx8fDE3NzM5OTg5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Vibrant bell peppers, packed with nutrients',
  },
  {
    id: '8',
    name: 'Fresh Broccoli',
    category: 'Vegetables',
    price: 3.99,
    unit: 'bunch',
    stockLevel: 18,
    lowStockThreshold: 15,
    image: 'https://images.unsplash.com/photo-1769195045450-a53e5fef9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyb2Njb2xpJTIwZ3JlZW4lMjB2ZWdldGFibGV8ZW58MXx8fHwxNzczODc4MjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Nutritious fresh broccoli, perfect for steaming or roasting',
  },
];

// Helper functions for dashboard calculations
export const getDashboardKPIs = () => {
  const totalRevenue = dashboardOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = dashboardOrders.length;
  const productsInStock = inventoryItems.reduce((sum, item) => sum + item.stockLevel, 0);
  const activeCustomers = new Set(dashboardOrders.map(order => order.customerId)).size;

  return {
    totalRevenue,
    totalOrders,
    productsInStock,
    activeCustomers,
  };
};

export const getWeeklySalesData = () => {
  return [
    { day: 'Mon', sales: 245 },
    { day: 'Tue', sales: 312 },
    { day: 'Wed', sales: 189 },
    { day: 'Thu', sales: 278 },
    { day: 'Fri', sales: 445 },
    { day: 'Sat', sales: 598 },
    { day: 'Sun', sales: 422 },
  ];
};

export const getRevenueData = () => {
  return [
    { month: 'Jan', revenue: 3245 },
    { month: 'Feb', revenue: 3890 },
    { month: 'Mar', revenue: 4156 },
  ];
};

export const getLowStockProducts = () => {
  return inventoryItems.filter(item => item.stockLevel <= item.lowStockThreshold);
};
