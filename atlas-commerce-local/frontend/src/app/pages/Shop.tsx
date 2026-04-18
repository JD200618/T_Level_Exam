import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Button, Input } from '../components/ui/core';

import { Search } from 'lucide-react';
import { StoreProduct, getProducts } from '../lib/api';

export function Shop() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getProducts()
      .then((items) => setProducts(items))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.producerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.producerLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productionMethod.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const inStockCount = products.filter((product) => product.inStock).length;
  const localProducerCount = new Set(products.map((product) => product.producerName)).size;

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2" style={{ color: '#2E2E2E' }}>
            GLH Product Catalogue
          </h1>
          <p className="text-lg" style={{ color: '#6B6B6B' }}>
            Transparent pricing, live availability, and local producer sourcing in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-white border">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>Live products</p>
            <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{products.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-white border">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>Currently in stock</p>
            <p className="text-2xl" style={{ color: '#2E7D32', fontWeight: 700 }}>{inStockCount}</p>
          </div>
          <div className="p-4 rounded-lg bg-white border">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>Local producers represented</p>
            <p className="text-2xl" style={{ color: '#2E2E2E', fontWeight: 700 }}>{localProducerCount}</p>
          </div>
        </div>

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#6B6B6B' }} />
          <Input
            type="text"
            placeholder="Search products, producers, or methods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              style={
                selectedCategory === category
                  ? { backgroundColor: '#2E7D32', color: 'white' }
                  : { borderColor: '#2E7D32', color: '#2E7D32' }
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12" style={{ color: '#6B6B6B' }}>
            Loading live catalog...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg mb-2" style={{ color: '#2E2E2E' }}>
                  No products found
                </p>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
