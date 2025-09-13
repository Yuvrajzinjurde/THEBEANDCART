
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import type { IProduct } from '@/models/product.model';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setProductsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleSeed = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      alert('Database seeded! Refresh the page to see new products.');
    } catch (error) {
      alert('Failed to seed database.');
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, IProduct[]>);

  // While checking auth or loading products, show a loader.
  if (loading || productsLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </main>
    );
  }

  // If not logged in, show the product landing page.
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {Object.entries(groupedProducts).map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <Button onClick={handleSeed} variant="outline">
          Seed Database
        </Button>
      </div>
    </main>
  );
}
