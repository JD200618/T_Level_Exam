import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Leaf, MapPin, ShoppingBasket, ArrowRight, Truck, Clock3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { StoreProduct, getProducts } from '../lib/api';

interface ProducerView {
  id: string;
  name: string;
  location: string;
  method: string;
  products: StoreProduct[];
}

function buildProducerViews(products: StoreProduct[]): ProducerView[] {
  const producerMap = new Map<string, ProducerView>();

  for (const product of products) {
    const key = `${product.producerName}::${product.producerLocation}`;
    const existing = producerMap.get(key);
    if (existing) {
      existing.products.push(product);
      continue;
    }

    producerMap.set(key, {
      id: key,
      name: product.producerName,
      location: product.producerLocation,
      method: product.productionMethod,
      products: [product],
    });
  }

  return Array.from(producerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function Producers() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getProducts()
      .then((items) => setProducts(items))
      .finally(() => setIsLoading(false));
  }, []);

  const producers = useMemo(() => buildProducerViews(products), [products]);

  const producerBenefits = [
    {
      title: 'Know who grows your food',
      description: 'Each product can be traced back to a named local producer with a visible growing or production method.',
      icon: Leaf,
    },
    {
      title: 'Shorter supply chain',
      description: 'GLH reduces food miles and keeps delivery, collection, and stock decisions closer to the local hub.',
      icon: Truck,
    },
    {
      title: 'Fresher seasonal planning',
      description: 'Live stock and collection windows help customers order around what is actually available from local producers.',
      icon: Clock3,
    },
  ];

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="container mx-auto px-4 space-y-10">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: '#2E7D32' }}>
            GLH producer directory
          </p>
          <h1 style={{ color: '#2E2E2E' }}>
            Local producers, transparent methods, and clear reasons to buy local
          </h1>
          <p className="max-w-3xl text-lg" style={{ color: '#6B6B6B' }}>
            Greenfield Local Hub connects customers with nearby growers, bakers, dairies, and food producers.
            This view shows who supplies the catalogue, how products are prepared, and why local buying matters.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {producerBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full mb-4" style={{ backgroundColor: '#A5D6A7' }}>
                  <Icon className="h-6 w-6" style={{ color: '#2E7D32' }} />
                </div>
                <h3 className="mb-2" style={{ color: '#2E2E2E' }}>{benefit.title}</h3>
                <p style={{ color: '#6B6B6B' }}>{benefit.description}</p>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>Producers represented</p>
            <p className="text-3xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{producers.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>Products in catalogue</p>
            <p className="text-3xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{products.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>Products currently in stock</p>
            <p className="text-3xl" style={{ color: '#2E7D32', fontWeight: 700 }}>
              {products.filter((product) => product.inStock).length}
            </p>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 style={{ color: '#2E2E2E' }}>Producer profiles</h2>
              <p style={{ color: '#6B6B6B' }}>
                Sourced directly from the current catalogue data.
              </p>
            </div>
            <Link to="/shop">
              <Button style={{ backgroundColor: '#2E7D32' }}>
                Browse the catalogue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Card className="p-8" style={{ color: '#6B6B6B' }}>Loading producer information...</Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {producers.map((producer) => (
                <Card key={producer.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 style={{ color: '#2E2E2E' }}>{producer.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: '#6B6B6B' }}>
                        <MapPin className="h-4 w-4" />
                        <span>{producer.location}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#A5D6A7', color: '#2E2E2E', fontWeight: 600 }}>
                      {producer.products.length} product{producer.products.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#6B6B6B' }}>Production method</p>
                    <p style={{ color: '#2E2E2E' }}>{producer.method}</p>
                  </div>

                  <div>
                    <p className="text-sm mb-3" style={{ color: '#6B6B6B' }}>Available through GLH</p>
                    <div className="space-y-2">
                      {producer.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: '#FAFAF5' }}>
                          <div>
                            <p style={{ color: '#2E2E2E', fontWeight: 600 }}>{product.name}</p>
                            <p className="text-sm" style={{ color: '#6B6B6B' }}>{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p style={{ color: '#2E7D32', fontWeight: 600 }}>£{product.price.toFixed(2)}</p>
                            <p className="text-xs" style={{ color: product.inStock ? '#2E7D32' : '#B91C1C' }}>
                              {product.inStock ? `${product.stockLevel} in stock` : 'Sold out'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl p-8 md:p-10" style={{ backgroundColor: '#2E7D32' }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-white mb-3">Buy local with clearer information and stronger supply visibility</h2>
              <p className="text-white/90">
                GLH is designed to show customers who is producing the food, how it is made, what is in stock,
                and how to order for collection or delivery.
              </p>
            </div>
            <Link to="/shop">
              <Button size="lg" style={{ backgroundColor: 'white', color: '#2E7D32' }}>
                <ShoppingBasket className="h-4 w-4 mr-2" />
                Start shopping
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
