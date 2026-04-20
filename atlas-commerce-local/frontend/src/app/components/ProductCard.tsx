import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { StoreProduct } from '../lib/api';
import { Button, Card } from './ui/core';

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const stockLabel = !product.inStock
    ? 'Sold out'
    : product.stockLevel <= product.lowStockThreshold
      ? `Low stock, ${product.stockLevel} left`
      : `${product.stockLevel} in stock`;

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`, {
        duration: 2000,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add item');
    }
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
            {product.category}
          </p>
          <h3 className="text-lg mt-1" style={{ color: '#2E2E2E' }}>
            {product.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: '#2E7D32' }}>
            {product.producerName}, {product.producerLocation}
          </p>
        </div>

        <p className="text-sm line-clamp-2" style={{ color: '#6B6B6B' }}>
          {product.description}
        </p>

        <div className="space-y-1">
          <p className="text-xs" style={{ color: '#6B6B6B' }}>
            {product.productionMethod}
          </p>
          <p
            className="text-xs font-medium"
            style={{ color: product.inStock ? '#2E7D32' : '#B91C1C' }}
          >
            {stockLabel}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xl" style={{ color: '#2E7D32', fontWeight: 600 }}>
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm ml-1" style={{ color: '#6B6B6B' }}>
              / {product.unit}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            size="sm"
            className="gap-2"
            disabled={!product.inStock}
            style={{ backgroundColor: '#2E7D32' }}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.inStock ? 'Add' : 'Sold Out'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
