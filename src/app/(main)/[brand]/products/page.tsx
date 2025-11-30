

"use client";

import { useEffect, useState, useMemo, useTransition, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import type { IBrand } from '@/models/brand.model';
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
import { ChevronDown, Smile, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';

export type ActiveFilters = {
  categories: string[];
  brands: string[];
  colors: string[];
  keywords: string[];
};

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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 pt-6 text-center">
        <p className="my-8 text-lg text-muted-foreground col-span-full">Just a moment, getting everything ready for you…</p>
        {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
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

const ProductCarouselSection = ({ title, products }: { title: string, products: IProduct[] }) => {
    if (!products || products.length === 0) return null;
    return (
        <section className="pt-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
            </div>
            <Separator className="mb-6" />
            <Carousel
                opts={{
                    align: "start",
                    loop: products.length > 5,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 sm:-ml-4">
                    {products.map((product) => (
                        <CarouselItem key={product._id as string} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
                            <BrandProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
    );
};


export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandName = params.brand as string;
  const initialCategory = searchParams.get('category');
  const initialKeyword = searchParams.get('keyword');

  const [brand, setBrand] = useState<IBrand | null>(null);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, totalProducts: 0, limit: 50 });
  const [popularProducts, setPopularProducts] = useState<IProduct[]>([]);

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    categories: initialCategory ? [initialCategory] : [],
    brands: [],
    colors: [],
    keywords: initialKeyword ? [initialKeyword] : [],
  });
  const [sortOption, setSortOption] = useState<string>('relevance');

  const updateURL = useCallback((filters: ActiveFilters, page: number, sortBy: string) => {
    const query = new URLSearchParams();
    if (filters.categories.length > 0) query.set('category', filters.categories.join(','));
    if (filters.brands.length > 0) query.set('brands', filters.brands.join(','));
    if (filters.colors.length > 0) query.set('colors', filters.colors.join(','));
    if (filters.keywords.length > 0) query.set('keyword', filters.keywords.join(','));
    if (sortBy !== 'relevance') query.set('sortBy', sortBy);
    if (page > 1) query.set('page', page.toString());
    
    // Using router.replace to avoid adding to history stack
    router.replace(`/${brandName}/products?${query.toString()}`, { scroll: false });
  }, [brandName, router]);


  const fetchProducts = useCallback((page: number, filters: ActiveFilters, sortBy: string) => {
    if (!brandName) return;
    
    startTransition(async () => {
        setError(null);
        try {
            const query = new URLSearchParams({ 
                storefront: brandName,
                page: page.toString(),
                limit: '50',
                sortBy: sortBy,
            });

            if (filters.categories.length > 0) query.append('category', filters.categories.join(','));
            if (filters.brands.length > 0) query.append('brands', filters.brands.join(','));
            if (filters.colors.length > 0) query.append('colors', filters.colors.join(','));
            if (filters.keywords.length > 0) query.append('keywords', filters.keywords.join(','));

            const productResponse = await fetch(`/api/products?${query.toString()}`);
            if(!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }
            const { products, pagination: newPagination } = await productResponse.json();
            
            setAllProducts(products);
            if (newPagination) {
                setPagination(newPagination);
            }

        } catch (error: any) {
            console.error(error);
            setError(error.message);
        }
    });
  }, [brandName]);
  
  useEffect(() => {
    fetchProducts(1, activeFilters, sortOption);
    updateURL(activeFilters, 1, sortOption);
  }, [activeFilters, sortOption, fetchProducts, updateURL]);

  useEffect(() => {
    async function fetchInitialData() {
        if (!brandName) return;
        setIsInitialLoading(true);
        try {
            const [brandResponse, popularResponse] = await Promise.all([
                fetch(`/api/brands/${brandName}`),
                fetch(`/api/products?${new URLSearchParams({ storefront: brandName, limit: '12', sortBy: 'popular' })}`)
            ]);

            if (brandResponse.ok) {
                const { brand: brandData } = await brandResponse.json();
                setBrand(brandData);
            }

            if (popularResponse.ok) {
                const { products } = await popularResponse.json();
                setPopularProducts(products);
            }
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            setError('Could not load brand information.');
        } finally {
            setIsInitialLoading(false);
        }
    }
    fetchInitialData();
  }, [brandName]);


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
        fetchProducts(newPage, activeFilters, sortOption);
        updateURL(activeFilters, newPage, sortOption);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({ categories: [], brands: [], colors: [], keywords: [] });
  };
  
  const currentCategory = useMemo(() => {
    if (activeFilters.categories.length === 1) return activeFilters.categories[0];
    return null;
  }, [activeFilters.categories]);

  if (isInitialLoading) {
      return (
           <main className="container py-8 px-4">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid lg:grid-cols-[280px_1fr] lg:gap-8">
                    <Skeleton className="hidden lg:block h-[600px] w-full" />
                    <ProductGridSkeleton />
                </div>
           </main>
      )
  }

  if (error) {
      return (
          <main className="container flex min-h-screen flex-col items-center justify-center px-4">
              <h1 className="text-2xl font-bold">Error</h1>
              <p className="text-muted-foreground">{error}</p>
          </main>
      )
  }

  return (
    <main className="container py-8 px-4">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${brandName}/home`}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${brandName}/products`}>Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    {currentCategory && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{currentCategory}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
        <div className="grid lg:grid-cols-[280px_1fr] lg:gap-8">
            <aside className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)]">
                <ProductFilters 
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onClearAll={clearAllFilters}
                />
            </aside>
            <div className="flex-1 min-w-0">
                 <div className="sticky top-16 z-10 bg-background pt-4 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
                                {currentCategory ? `${currentCategory}` : `All Products`}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{pagination.totalProducts} products</p>
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
                                        activeFilters={activeFilters}
                                        onFilterChange={handleFilterChange}
                                        onClearAll={clearAllFilters}
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

                {isPending ? (
                     <ProductGridSkeleton />
                ) : allProducts.length > 0 ? (
                    <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 pt-6">
                        {allProducts.map((product) => (
                            <BrandProductCard key={product._id as string} product={product} />
                        ))}
                    </div>
                    <PaginationComponent pagination={pagination} onPageChange={handlePageChange} />
                    </>
                ) : (
                    <div className="text-center py-16 border rounded-lg mt-6 flex flex-col items-center">
                        <Smile className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-semibold">We're working to get these products on board for you!</p>
                        <p className="text-sm text-muted-foreground">Your filter combination yielded no results for now.</p>
                         <Button variant="link" className="mt-2" onClick={clearAllFilters}>Clear all filters</Button>
                    </div>
                )}
                 <div className="mt-16">
                    <ProductCarouselSection title="Explore Our Popular Products" products={popularProducts} />
                </div>
            </div>
        </div>
    </main>
  );
}
