
"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import { Loader } from '@/components/ui/loader';
import { BrandProductCard } from '@/components/brand-product-card';
import { ProductFilters } from '@/components/product-filters';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const brandName = params.brand as string;
  const category = searchParams.get('category');

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
        if (!brandName) return;
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({ storefront: brandName });
            if (category) {
                query.set('category', category);
            }
            
            const productResponse = await fetch(`/api/products?${query.toString()}`);
            if(!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }
            const productData = await productResponse.json();
            setProducts(productData.products);

        } catch (error: any) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    fetchProducts();
  }, [brandName, category]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader className="h-12 w-12" />
      </main>
    );
  }
  
  if (error) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">Error</h1>
              <p className="text-muted-foreground">{error}</p>
          </main>
      )
  }

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
            <ProductFilters products={products} />
            <div className="flex-1">
                 <div className="sticky top-[65px] z-10 bg-background pb-4 pt-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${brandName}/home`}>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${brandName}/products`}>Products</BreadcrumbLink>
                            </BreadcrumbItem>
                            {category && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{category}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                    
                    <div className="flex items-baseline justify-between mt-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
                                {category ? `${category}` : `All Products`}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="shrink-0">
                                    Sort by: <span className="font-semibold ml-1">Relevance</span>
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Relevance</DropdownMenuItem>
                                <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                                <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                                <DropdownMenuItem>Newest</DropdownMenuItem>
                                <DropdownMenuItem>Rating</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pt-6">
                        {products.map((product) => (
                            <BrandProductCard key={product._id as string} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border rounded-lg">
                        <p className="text-lg font-semibold">No Products Found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    </main>
  );
}
