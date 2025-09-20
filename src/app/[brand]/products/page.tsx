

"use client";

import { useEffect, useState, useMemo, useTransition } from 'react';
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
import { ChevronDown, Smile, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';


export type ActiveFilters = {
  categories: string[];
  brands: string[];
  genders: string[];
  colors: string[];
  keywords: string[];
};

const SORT_OPTIONS: { [key: string]: string } = {
  relevance: "Relevance",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
  rating: "Rating",
};

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 pt-6 text-center">
        <p className="my-8 text-lg text-muted-foreground col-span-full">Just a moment, getting everything ready for you…</p>
        {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
            </div>
        ))}
    </div>
);


export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const brandName = params.brand as string;
  const initialCategory = searchParams.get('category');
  const initialKeyword = searchParams.get('keyword');

  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    categories: initialCategory ? [initialCategory] : [],
    brands: [],
    genders: [],
    colors: [],
    keywords: initialKeyword ? [initialKeyword] : [],
  });
  const [sortOption, setSortOption] = useState<string>('relevance');

  useEffect(() => {
    async function fetchProducts() {
        if (!brandName) return;
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({ storefront: brandName });
            // Fetch all products for the storefront initially
            const productResponse = await fetch(`/api/products?${query.toString()}`);
            if(!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }
            const productData = await productResponse.json();
            setAllProducts(productData.products);
            setFilteredProducts(productData.products); // Initially, all products are filtered products

        } catch (error: any) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    fetchProducts();
  }, [brandName]);

  useEffect(() => {
    startTransition(() => {
        let productsToFilter = [...allProducts];

        // Apply filters
        productsToFilter = productsToFilter.filter(p => {
            const categoryMatch = activeFilters.categories.length === 0 || (Array.isArray(p.category) ? activeFilters.categories.some(c => p.category.includes(c)) : activeFilters.categories.includes(p.category));
            const brandMatch = activeFilters.brands.length === 0 || (p.brand && activeFilters.brands.includes(p.brand));
            const colorMatch = activeFilters.colors.length === 0 || (p.color && activeFilters.colors.includes(p.color));
            const keywordMatch = activeFilters.keywords.length === 0 || (p.keywords && activeFilters.keywords.some(filterKeyword => 
                p.keywords.some(productKeyword => productKeyword.toLowerCase().includes(filterKeyword.toLowerCase()))
            ));
            return categoryMatch && brandMatch && colorMatch && keywordMatch;
        });

        // Apply sorting
        switch(sortOption) {
            case 'price-asc':
                productsToFilter.sort((a, b) => a.sellingPrice - b.sellingPrice);
                break;
            case 'price-desc':
                productsToFilter.sort((a, b) => b.sellingPrice - a.sellingPrice);
                break;
            case 'newest':
                productsToFilter.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
                break;
            case 'rating':
                // @ts-ignore
                productsToFilter.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'relevance':
            default:
                // Default sort is by creation date (newest first) as fetched from API
                break;
        }
        
        setFilteredProducts(productsToFilter);
    });
  }, [allProducts, activeFilters, sortOption]);
  
  const handleFilterChange = (filterType: keyof ActiveFilters, value: string, isChecked: boolean) => {
    setActiveFilters(prev => {
        const currentValues = prev[filterType];
        const newValues = isChecked 
            ? [...currentValues, value] 
            : currentValues.filter(v => v !== value);
        return { ...prev, [filterType]: newValues };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ categories: [], brands: [], genders: [], colors: [], keywords: [] });
    // Also clear the URL query param if needed
    const newUrl = `/${brandName}/products`;
    window.history.pushState({}, '', newUrl);
  };
  
  const currentCategory = useMemo(() => {
    // If there's one category selected, show it. Otherwise, fallback to initial.
    if (activeFilters.categories.length === 1) return activeFilters.categories[0];
    return null;
  }, [activeFilters.categories]);

  // Determine which set of products to use for generating filter options
  // For categories, we always want to show all possible categories from the storefront
  // For other filters, we want to show options based on the currently filtered products
  const productsForCategoryFilter = allProducts;
  const productsForOtherFilters = filteredProducts;

  if (error) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">Error</h1>
              <p className="text-muted-foreground">{error}</p>
          </main>
      )
  }

  return (
    <main className="container py-8">
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
            <Button variant="link" className="p-0 h-auto text-primary" onClick={clearAllFilters}>CLEAR ALL</Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
             <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
                <ProductFilters 
                    productsForCategories={productsForCategoryFilter}
                    productsForOthers={productsForOtherFilters}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                />
            </div>
            <div className="flex-1">
                 <div className="sticky top-16 z-10 bg-background pt-4 pb-4">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
                                {currentCategory ? `${currentCategory}` : `All Products`}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} products</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-full max-w-sm">
                                    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                                    <div className="p-4">
                                         <ProductFilters 
                                            productsForCategories={productsForCategoryFilter}
                                            productsForOthers={productsForOtherFilters}
                                            activeFilters={activeFilters}
                                            onFilterChange={handleFilterChange}
                                        />
                                    </div>
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
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 pt-6">
                        {filteredProducts.map((product) => (
                            <BrandProductCard key={product._id as string} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border rounded-lg mt-6 flex flex-col items-center">
                        <Smile className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-semibold">We're working to get these products on board for you!</p>
                        <p className="text-sm text-muted-foreground">Your filter combination yielded no results for now.</p>
                         <Button variant="link" className="mt-2" onClick={clearAllFilters}>Clear all filters</Button>
                    </div>
                )}
            </div>
        </div>
    </main>
  );
}
