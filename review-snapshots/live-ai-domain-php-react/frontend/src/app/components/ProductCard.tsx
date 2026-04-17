import { ShoppingCart } from 'lucide-react';
import { StoreProduct } from '../lib/api';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isSeasonal = ['1', '2', '3'].includes(product.id);

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
        {isSeasonal && (
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs uppercase tracking-wider"
            style={{ backgroundColor: '#FF9800', color: 'white', fontWeight: 600 }}
          >
            Seasonal
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
            {product.category}
          </p>
          <h3 className="text-lg mt-1" style={{ color: '#2E2E2E' }}>
            {product.name}
          </h3>
        </div>

        <p className="text-sm line-clamp-2" style={{ color: '#6B6B6B' }}>
          {product.description}
        </p>

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
            onClick={() => void handleAddToCart()}
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
