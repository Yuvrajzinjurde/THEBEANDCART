
"use client";

import { useEffect, useState, useMemo, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import { Loader } from '@/components/ui/loader';
import { BrandProductCard } from '@/components/brand-product-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Smile } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalFooter } from '@/components/global-footer';

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pt-6 text-center">
        <p className="my-8 text-lg text-muted-foreground col-span-full">Searching for products...</p>
        {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
            </div>
        ))}
    </div>
);

const PaginationComponent = ({ pagination, onPageChange }: { pagination: Pagination, onPageChange: (page: number) => void }) => {
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button 
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <Button 
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get('keyword');

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, totalProducts: 0, limit: 50 });
  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!keyword) {
          setProducts([]);
          setLoading(false);
          return;
      };
      setLoading(true);
      setError(null);
      try {
          const query = new URLSearchParams({ 
              keyword,
              page: currentPage.toString(),
              limit: '50'
          });

          const response = await fetch(`/api/products?${query.toString()}`);
          if(!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to fetch search results');
          }
          const { products, pagination: newPagination } = await response.json();
          
          setProducts(products);
          if (newPagination) {
              setPagination(newPagination);
          }

      } catch (error: any) {
          console.error(error);
          setError(error.message);
      } finally {
          setLoading(false);
      }
    };
    
    startTransition(() => {
        fetchProducts();
    })

  }, [keyword, currentPage]);
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage.toString());
        router.push(`/search?${params.toString()}`);
    }
  };


  if (error) {
      return (
          <main className="container flex min-h-screen flex-col items-center justify-center px-4">
              <h1 className="text-2xl font-bold">Error</h1>
              <p className="text-muted-foreground">{error}</p>
          </main>
      )
  }

  return (
    <>
    <main className="container py-8 px-4">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/`}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Search</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
        
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Search Results for &quot;{keyword}&quot;
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{pagination.totalProducts} products found</p>
        </div>

        {loading || isPending ? (
             <ProductGridSkeleton />
        ) : products.length > 0 ? (
            <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pt-6">
                {products.map((product) => (
                    <BrandProductCard key={product._id as string} product={product} />
                ))}
            </div>
            <PaginationComponent pagination={pagination} onPageChange={handlePageChange} />
            </>
        ) : (
            <div className="text-center py-16 border rounded-lg mt-6 flex flex-col items-center">
                <Smile className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-semibold">No results found for &quot;{keyword}&quot;</p>
                <p className="text-sm text-muted-foreground">Try searching for something else.</p>
            </div>
        )}
    </main>
    <GlobalFooter />
    </>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<ProductGridSkeleton />}>
            <SearchResults />
        </Suspense>
    )
}
