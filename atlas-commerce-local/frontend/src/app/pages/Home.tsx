import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Leaf, Truck, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { StoreProduct, getProducts } from '../lib/api';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    void getProducts()
      .then((products) => setFeaturedProducts(products.slice(0, 4)))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <div className="min-h-screen">
      <section
        className="relative h-[600px] flex items-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1747503331142-27f458a1498c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXJzJTIwbWFya2V0JTIwZnJlc2glMjBwcm9kdWNlfGVufDF8fHx8MTc3Mzk5MDYxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl text-white mb-6">
              Fresh Local Produce Delivered to Your Door
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Support local farmers and enjoy the freshest seasonal fruits and vegetables
            </p>
            <Link to="/shop">
              <Button
                size="lg"
                className="gap-2 text-lg"
                style={{ backgroundColor: '#2E7D32' }}
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4"
                style={{ backgroundColor: '#A5D6A7' }}
              >
                <Leaf className="h-8 w-8" style={{ color: '#2E7D32' }} />
              </div>
              <h3 className="mb-2" style={{ color: '#2E2E2E' }}>
                100% Organic
              </h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                All our produce is certified organic and grown without harmful pesticides
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4"
                style={{ backgroundColor: '#A5D6A7' }}
              >
                <Truck className="h-8 w-8" style={{ color: '#2E7D32' }} />
              </div>
              <h3 className="mb-2" style={{ color: '#2E2E2E' }}>
                Fast Delivery
              </h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Same-day delivery available for orders placed before noon
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4"
                style={{ backgroundColor: '#A5D6A7' }}
              >
                <Shield className="h-8 w-8" style={{ color: '#2E7D32' }} />
              </div>
              <h3 className="mb-2" style={{ color: '#2E2E2E' }}>
                Quality Guaranteed
              </h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                100% satisfaction guarantee on all products
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#FAFAF5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4" style={{ color: '#2E2E2E' }}>
              Featured Products
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B6B6B' }}>
              Hand-picked selection of the freshest seasonal produce
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/shop">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
              >
                View All Products
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12" style={{ backgroundColor: '#FFC107' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-3xl mb-2" style={{ color: '#2E2E2E' }}>
                🌽 Seasonal Special
              </h3>
              <p className="text-lg" style={{ color: '#2E2E2E' }}>
                Spring harvest is here! Get 15% off on all seasonal vegetables
              </p>
            </div>
            <Link to="/shop">
              <Button
                size="lg"
                className="gap-2"
                style={{ backgroundColor: '#2E7D32', color: 'white' }}
              >
                Shop Seasonal
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#2E7D32' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl text-white mb-4">
            Ready to Experience Farm-Fresh Quality?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers enjoying the best local produce
          </p>
          <Link to="/shop">
            <Button
              size="lg"
              className="gap-2"
              style={{ backgroundColor: 'white', color: '#2E7D32' }}
            >
              Start Shopping
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
