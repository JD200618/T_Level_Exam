export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    price: 4.99,
    unit: 'lb',
    image: 'https://images.unsplash.com/photo-1700064165267-8fa68ef07167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB0b21hdG9lcyUyMGZyZXNoJTIwcHJvZHVjZXxlbnwxfHx8fDE3NzM5OTg5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Fresh, vine-ripened organic tomatoes bursting with flavor',
    inStock: true,
  },
  {
    id: '2',
    name: 'Green Lettuce',
    category: 'Vegetables',
    price: 2.99,
    unit: 'head',
    image: 'https://images.unsplash.com/photo-1657411658279-e32af8636eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGdyZWVuJTIwbGV0dHVjZXxlbnwxfHx8fDE3NzM5ODIyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Crisp and fresh lettuce, perfect for salads',
    inStock: true,
  },
  {
    id: '3',
    name: 'Organic Carrots',
    category: 'Vegetables',
    price: 3.49,
    unit: 'lb',
    image: 'https://images.unsplash.com/photo-1611048660183-dc688cc049f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBjYXJyb3RzJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzM5NTIxNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Sweet and crunchy organic carrots',
    inStock: true,
  },
  {
    id: '4',
    name: 'Fresh Apples',
    category: 'Fruits',
    price: 5.99,
    unit: 'lb',
    image: 'https://images.unsplash.com/photo-1623815242959-fb20354f9b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBhcHBsZXMlMjBmcmVzaCUyMGZydWl0fGVufDF8fHx8MTc3Mzg5MjMwOHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Crisp, juicy apples picked fresh from local orchards',
    inStock: true,
  },
  {
    id: '5',
    name: 'Strawberries',
    category: 'Fruits',
    price: 6.99,
    unit: 'pint',
    image: 'https://images.unsplash.com/photo-1710528184650-fc75ae862c13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllcyUyMGJlcnJpZXN8ZW58MXx8fHwxNzczOTg5MjQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Sweet, ripe strawberries perfect for snacking',
    inStock: true,
  },
  {
    id: '6',
    name: 'Fresh Cucumbers',
    category: 'Vegetables',
    price: 3.99,
    unit: 'lb',
    image: 'https://images.unsplash.com/photo-1725369865895-0dd4566c8864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGN1Y3VtYmVycyUyMGdyZWVuJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzM5MzY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Refreshing cucumbers, great for salads and pickling',
    inStock: true,
  },
  {
    id: '7',
    name: 'Bell Peppers',
    category: 'Vegetables',
    price: 4.49,
    unit: 'lb',
    image: 'https://images.unsplash.com/photo-1741515042519-9b52d3ec2eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZWxsb3clMjBiZWxsJTIwcGVwcGVyc3xlbnwxfHx8fDE3NzM5OTg5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Vibrant bell peppers, packed with nutrients',
    inStock: true,
  },
  {
    id: '8',
    name: 'Fresh Broccoli',
    category: 'Vegetables',
    price: 3.99,
    unit: 'bunch',
    image: 'https://images.unsplash.com/photo-1769195045450-a53e5fef9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyb2Njb2xpJTIwZ3JlZW4lMjB2ZWdldGFibGV8ZW58MXx8fHwxNzczODc4MjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Nutritious fresh broccoli, perfect for steaming or roasting',
    inStock: true,
  },
];

export const categories = ['All', 'Vegetables', 'Fruits'];
