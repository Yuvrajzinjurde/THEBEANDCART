
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { IProduct } from '@/models/product.model';
import { ProductFilters } from '@/components/product-filters';

export default function Home() {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('rating-desc');


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
      // Optionally re-fetch products
      setProductsLoading(true);
       const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
        setProductsLoading(false);

    } catch (error) {
      alert('Failed to seed database.');
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    return result;
  }, [products, searchTerm, categoryFilter, sortOption]);
  

  const uniqueCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return ['all', ...Array.from(categories)];
  }, [products]);


  // While checking auth or loading products, show a loader.
  if (authLoading || productsLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </main>
    );
  }

  // If not logged in, show the product landing page.
  return (
    <main className="flex-1">
      <section className="bg-secondary text-foreground py-20 text-center">
        <div className="container">
          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
            Discover Your Next Favorite Thing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse our curated collection of high-quality products.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <ProductFilters
            categories={uniqueCategories}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategoryFilter}
            onSortChange={setSortOption}
          />
        
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-8 mt-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
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
