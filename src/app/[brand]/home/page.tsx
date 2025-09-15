
"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { IProduct } from '@/models/product.model';
import type { IBrand } from '@/models/brand.model';
import { ProductFilters } from '@/components/product-filters';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Loader } from '@/components/ui/loader';
import { Skeleton } from '@/components/ui/skeleton';


export default function BrandHomePage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const brandName = params.brand as string;

  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('rating-desc');

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    async function fetchBrandData() {
        if (!brandName) return;
        setLoading(true);
        try {
            // Fetch brand details
            const brandResponse = await fetch(`/api/brands/${brandName}`);
            if (!brandResponse.ok) throw new Error('Brand not found');
            const brandData = await brandResponse.json();
            setBrand(brandData.brand);

            // Fetch products for the brand
            const productResponse = await fetch(`/api/products?storefront=${brandName}`);
            if (!productResponse.ok) throw new Error('Failed to fetch products');
            const productData = await productResponse.json();
            setProducts(productData.products);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    fetchBrandData();
  }, [brandName]);


  const handleSeed = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      alert('Database seeded! Refresh the page to see new products.');
      // Optionally re-fetch products
      setLoading(true);
       const response = await fetch(`/api/products?storefront=${brandName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
        setLoading(false);

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
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
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
  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader className="h-12 w-12" />
      </main>
    );
  }
  
  if (!brand) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">Brand not found</h1>
              <p className="text-muted-foreground">The requested brand does not exist.</p>
          </main>
      )
  }

  // If not logged in, show the product landing page.
  return (
    <main className="flex-1">
        <section className="w-full">
            <Carousel 
                className="w-full"
                plugins={[plugin.current]}
                onMouseEnter={() => plugin.current.stop()}
                onMouseLeave={() => plugin.current.reset()}
            >
                <CarouselContent>
                {brand.banners.map((banner, index) => (
                    <CarouselItem key={index}>
                        <div className="relative w-full h-[300px] md:h-[400px] bg-secondary text-foreground">
                            <Image
                                src={banner.imageUrl}
                                alt={banner.title}
                                fill
                                className="object-cover"
                                data-ai-hint={banner.imageHint}
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-black/50" />
                            <div className="container relative h-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
                                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
                                    {banner.title}
                                </h1>
                                <p className="mt-4 text-base md:text-lg max-w-2xl">
                                    {banner.description}
                                </p>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <ProductFilters
            categories={uniqueCategories}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategoryFilter}
            onSortChange={setSortOption}
          />
        
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-8 mt-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
      </div>
      {user?.roles.includes('admin') && (
        <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={handleSeed} variant="outline">
            Seed Database
            </Button>
        </div>
      )}
    </main>
  );
}
