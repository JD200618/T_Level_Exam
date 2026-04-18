import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Leaf, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ProductCard } from '../components/ProductCard';
import { StoreProduct, getProducts } from '../lib/api';

export function Home() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    void getProducts()
      .then((items) => {
        setProducts(items);
        setLoadError('');
      })
      .catch((error) => {
        setProducts([]);
        setLoadError(error instanceof Error ? error.message : 'Unable to load the product catalogue.');
      });
  }, []);

  const featuredProducts = useMemo(() => products.filter((product) => product.inStock).slice(0, 4), [products]);
  const producerHighlights = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      const key = `${product.producerName}::${product.producerLocation}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  }, [products]);

  const localBenefits = [
    {
      title: 'Transparent producer information',
      description: 'Customers can see who produced the item, where it comes from, and how it was grown or prepared.',
      icon: Leaf,
    },
    {
      title: 'Clear collection and delivery flow',
      description: 'Orders can be placed for local collection or delivery with live availability and time-window choices.',
      icon: Truck,
    },
    {
      title: 'Reliable local stock visibility',
      description: 'The catalogue shows current pricing and stock position so customers order from what is actually available.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen">
      <section
        className="relative min-h-[620px] flex items-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1747503331142-27f458a1498c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXJzJTIwbWFya2V0JTIwZnJlc2glMjBwcm9kdWNlfGVufDF8fHx8MTc3Mzk5MDYxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80">
              Greenfield Local Hub
            </p>
            <h1 className="text-5xl md:text-6xl text-white">
              Local producers, transparent food choices, and a practical way to order locally
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              GLH connects customers with nearby farmers and food producers through a catalogue with live pricing,
              stock visibility, account management, and collection or delivery ordering.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="gap-2 text-lg" style={{ backgroundColor: '#2E7D32' }}>
                  Browse products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/producers">
                <Button size="lg" variant="outline" className="gap-2 text-lg bg-white/10 border-white text-white hover:bg-white/20">
                  Meet the producers
                  <MapPin className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <section className="py-6" style={{ backgroundColor: '#FFF9E6' }}>
          <div className="container mx-auto px-4">
            <Card className="p-4" style={{ borderLeft: '4px solid #FF9800' }}>
              <p style={{ color: '#2E2E2E', fontWeight: 600 }}>Catalogue connection issue</p>
              <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>{loadError}</p>
            </Card>
          </div>
        </section>
      )}

      <section className="py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {localBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="p-6 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4" style={{ backgroundColor: '#A5D6A7' }}>
                    <Icon className="h-8 w-8" style={{ color: '#2E7D32' }} />
                  </div>
                  <h3 className="mb-2" style={{ color: '#2E2E2E' }}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#6B6B6B' }}>
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#FAFAF5' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <h2 className="mb-4" style={{ color: '#2E2E2E' }}>
                Producer highlights
              </h2>
              <p className="text-lg max-w-2xl" style={{ color: '#6B6B6B' }}>
                The catalogue now carries named local producers, locations, and production methods.
              </p>
            </div>
            <Link to="/producers">
              <Button variant="outline" className="gap-2" style={{ borderColor: '#2E7D32', color: '#2E7D32' }}>
                View all producers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {producerHighlights.map((product) => (
              <Card key={product.id} className="p-6">
                <p className="text-sm uppercase tracking-wide mb-2" style={{ color: '#2E7D32' }}>
                  {product.producerName}
                </p>
                <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: '#6B6B6B' }}>
                  <MapPin className="h-4 w-4" />
                  <span>{product.producerLocation}</span>
                </div>
                <p className="mb-4" style={{ color: '#2E2E2E' }}>{product.productionMethod}</p>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  Current catalogue items from this producer include <strong>{product.name}</strong> and related local products.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4" style={{ color: '#2E2E2E' }}>
              Featured catalogue items
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B6B6B' }}>
              Local food and produce with visible source information, live stock, and current pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/shop">
              <Button variant="outline" size="lg" className="gap-2" style={{ borderColor: '#2E7D32', color: '#2E7D32' }}>
                View full catalogue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: '#2E7D32' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl text-white mb-4">
            Order for collection or delivery through one GLH flow
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            The current prototype supports customer accounts, live stock visibility, collection or delivery selection,
            order history, and a producer-facing dashboard for stock and product maintenance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop">
              <Button size="lg" className="gap-2" style={{ backgroundColor: 'white', color: '#2E7D32' }}>
                Start ordering
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/account">
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                View account area
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
