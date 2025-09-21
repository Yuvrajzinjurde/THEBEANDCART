
"use client";

import { useEffect, useState, useMemo, useTransition, Suspense, useCallback } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown, Smile, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalFooter } from '@/components/global-footer';
import { ProductFilters } from '@/components/product-filters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { ActiveFilters } from '@/app/[brand]/products/page';

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

const SORT_OPTIONS: { [key: string]: string } = {
  relevance: "Relevance",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
  rating: "Rating",
};

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
  
  const initialKeyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, totalProducts: 0, limit: 50 });
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    categories: [],
    brands: [],
    colors: [],
    keywords: initialKeyword ? [initialKeyword] : [],
  });
  const [sortOption, setSortOption] = useState<string>('relevance');
  
  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);

  const updateURL = useCallback((filters: ActiveFilters, page: number, sortBy: string) => {
    const query = new URLSearchParams();
    if (filters.keywords.length > 0) query.set('keyword', filters.keywords.join(','));
    if (filters.categories.length > 0) query.set('category', filters.categories.join(','));
    if (filters.brands.length > 0) query.set('brands', filters.brands.join(','));
    if (filters.colors.length > 0) query.set('colors', filters.colors.join(','));
    if (page > 1) query.set('page', page.toString());
    if (sortBy !== 'relevance') query.set('sortBy', sortBy);
    
    router.replace(`/search?${query.toString()}`, { scroll: false });
  }, [router]);

  const fetchProducts = useCallback(async (page: number, filters: ActiveFilters, sortBy: string) => {
    if (!filters.keywords.length) {
        setProducts([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const query = new URLSearchParams({ 
            page: page.toString(),
            limit: '50',
            sortBy: sortBy,
        });

        if (filters.keywords.length > 0) query.append('keyword', filters.keywords.join(','));
        if (filters.categories.length > 0) query.append('category', filters.categories.join(','));
        if (filters.brands.length > 0) query.append('brands', filters.brands.join(','));
        if (filters.colors.length > 0) query.append('colors', filters.colors.join(','));

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
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchProducts(1, activeFilters, sortOption);
      updateURL(activeFilters, 1, sortOption);
    });
  }, [activeFilters, sortOption, fetchProducts, updateURL]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: string, isChecked: boolean) => {
    setActiveFilters(prev => {
        const currentValues = prev[filterType];
        const newValues = isChecked 
            ? [...currentValues, value] 
            : currentValues.filter(v => v !== value);
        return { ...prev, [filterType]: newValues };
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
        startTransition(() => {
            fetchProducts(newPage, activeFilters, sortOption);
            updateURL(activeFilters, newPage, sortOption);
        })
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      categories: [],
      brands: [],
      colors: [],
      keywords: initialKeyword ? [initialKeyword] : [], // Keep the original keyword
    });
  };

  if (error) {
      return (
          <main className="container flex min-h-screen flex-col items-center justify-center px-10">
              <h1 className="text-2xl font-bold">Error</h1>
              <p className="text-muted-foreground">{error}</p>
          </main>
      )
  }

  return (
    <>
    <main className="container py-8 px-10">
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
        
        <div className="grid lg:grid-cols-4 lg:gap-8">
            <aside className="hidden lg:block lg:col-span-1 sticky top-24 h-[calc(100vh-8rem)]">
                <ProductFilters 
                    onFilterChange={handleFilterChange}
                    onClearAll={clearAllFilters}
                    activeFilters={activeFilters}
                />
            </aside>
            <div className="flex-1 min-w-0 lg:col-span-3">
                <div className="sticky top-16 z-10 bg-background pt-4 pb-4 lg:pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
                        <div>
                             <div className="text-lg">
                                <span className="text-muted-foreground">Search Results for </span> 
                                <span className="font-bold text-xl">&quot;{initialKeyword}&quot;</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{pagination.totalProducts} products found</p>
                        </div>
                        <div className="flex items-center gap-2 self-end">
                             <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-full max-w-sm p-0">
                                    <SheetHeader className="p-4 border-b">
                                        <SheetTitle className="sr-only">Filters</SheetTitle>
                                    </SheetHeader>
                                    <ProductFilters 
                                        onFilterChange={handleFilterChange}
                                        onClearAll={clearAllFilters}
                                        activeFilters={activeFilters}
                                    />
                                </SheetContent>
                            </Sheet>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="shrink-0">
                                        Sort by: <span className="font-semibold ml-1 hidden sm:inline">{SORT_OPTIONS[sortOption]}</span>
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                                        <DropdownMenuItem key={key} onClick={() => setSortOption(key)}>
                                            {value}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {loading || isPending ? (
                    <ProductGridSkeleton />
                ) : products.length > 0 ? (
                    <>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 pt-6">
                        {products.map((product) => (
                            <BrandProductCard key={product._id as string} product={product} />
                        ))}
                    </div>
                    <PaginationComponent pagination={pagination} onPageChange={handlePageChange} />
                    </>
                ) : (
                    <div className="text-center py-16 border rounded-lg mt-6 flex flex-col items-center">
                        <Smile className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-semibold">No results found for &quot;{initialKeyword}&quot;</p>
                        <p className="text-sm text-muted-foreground">Try searching for something else or adjusting your filters.</p>
                         <Button variant="link" className="mt-2" onClick={clearAllFilters}>Clear all filters</Button>
                    </div>
                )}
            </div>
        </div>
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
