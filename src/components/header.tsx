
"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Menu, X, Search, Gift, Shirt, Home as HomeIcon, User, Bell, Package, Box } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IBrand } from "@/models/brand.model";
import type { IProduct } from "@/models/product.model";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import usePlatformSettingsStore from "@/stores/platform-settings-store";

export default function Header() {
  const { user } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { cart, wishlist } = useUserStore();
  const { settings } = usePlatformSettingsStore();

  const [brandName, setBrandName] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);

  // State for search suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const effectiveBrandName = brandName || 'reeva';
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const showSecondaryNav = useMemo(() => {
    if (!hasMounted) return false;

    const pathBrand = params.brand as string;
    const queryBrand = searchParams.get('storefront');
    
    let determinedBrand: string | null = null;
    if (pathname.startsWith('/admin') || pathname.startsWith('/legal') || pathname === '/' || pathname === '/wishlist' || pathname === '/create-hamper' || pathname === '/cart' || pathname === '/search') {
      determinedBrand = null;
    } else {
      determinedBrand = pathBrand || queryBrand || 'reeva';
    }
    
    return pathname === `/${determinedBrand}/home`;
  }, [hasMounted, pathname, params, searchParams]);

  
  useEffect(() => {
    if (!hasMounted) return;

    const pathBrand = params.brand as string;
    const queryBrand = searchParams.get('storefront');
    
    let determinedBrand: string | null = null;
    if (pathname.startsWith('/admin') || pathname.startsWith('/legal') || pathname === '/' || pathname === '/wishlist' || pathname === '/create-hamper' || pathname === '/cart' || pathname === '/search') {
      determinedBrand = null;
    } else {
      determinedBrand = pathBrand || queryBrand || 'reeva';
    }
    setBrandName(determinedBrand);
  }, [hasMounted, pathname, params, searchParams]);

  const cartCount = cart?.items?.filter(Boolean).length ?? 0;
  const wishlistCount = wishlist?.products?.length ?? 0;
  
  const secondaryNavItems = [
    { href: `/${effectiveBrandName}/products?keyword=gift`, icon: Gift, label: "Gifts" },
    { href: `/${effectiveBrandName}/products?keyword=fashion`, icon: Shirt, label: "Fashion Finds" },
    { href: `/${effectiveBrandName}/products?keyword=home`, icon: HomeIcon, label: "Home Favourites" },
  ];
  
  const categories = useMemo(() => {
    if (!brandName || !brand?.categories) return [];
    const productCategories = new Set(allProducts.map(p => p.category));
    return brand.categories.filter(cat => productCategories.has(cat));
  }, [allProducts, brand, brandName]);
  
  const allAvailableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    allProducts.forEach(p => {
        if (p.category && typeof p.category === 'string') {
            categorySet.add(p.category);
        } else if (p.category && Array.isArray(p.category)) {
            p.category.forEach(cat => {
                if(typeof cat === 'string') categorySet.add(cat)
            });
        }
    });
    return Array.from(categorySet);
  }, [allProducts]);

  useEffect(() => {
    async function fetchBrandData() {
      if (!brandName) {
        // Fetch all products for global pages to power search suggestions
        try {
            const productsRes = await fetch(`/api/products?limit=1000`);
            if (productsRes.ok) {
                const { products: productData } = await productsRes.json();
                setAllProducts(productData);
            }
        } catch (error) {
            console.error("Failed to fetch all products for header", error);
        }
        setBrand(null);
        return;
      };
      try {
        const [brandRes, productsRes] = await Promise.all([
          fetch(`/api/brands/${brandName}`),
          fetch(`/api/products?storefront=${brandName}&limit=1000`)
        ]);

        if (brandRes.ok) {
          const { brand: brandData } = await brandRes.json();
          setBrand(brandData);
        } else {
          setBrand(null);
        }

        if (productsRes.ok) {
          const { products: productData } = await productsRes.json();
          setAllProducts(productData);
        } else {
          setAllProducts([]);
        }

      } catch (error) {
        console.error("Failed to fetch brand data for header", error);
        setBrand(null);
        setAllProducts([]);
      }
    }
    if (hasMounted) {
        fetchBrandData();
    }
  }, [brandName, hasMounted]);
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
    if (query) {
        executeSearch(query);
    }
  };
  
  // Execute search based on context
  const executeSearch = (query: string) => {
    if (brandName) {
      router.push(`/${brandName}/products?keyword=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search?keyword=${encodeURIComponent(query)}`);
    }
    setSearchQuery("");
    setIsSuggestionsOpen(false);
  };
  
  // Handle search input change for suggestions
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      const matchedSuggestions = allAvailableCategories.filter(category =>
        category.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matchedSuggestions);
      setIsSuggestionsOpen(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };
  
  // Handle clicks outside search to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const currentDisplayName = hasMounted && brand && brandName ? brand.displayName : settings.platformName;
  const homeLink = hasMounted && brandName ? `/${brandName}/home` : '/';

  const DesktopNavActions = () => (
    <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
            <Link href="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                 {wishlistCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{wishlistCount}</span>}
            </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
            <Link href="#">
                <Bell className="h-5 w-5" />
            </Link>
        </Button>
        <UserNav />
        <Button variant="ghost" size="icon" aria-label="Cart" asChild>
            <Link href={`/cart`} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{cartCount}</span>}
            </Link>
        </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href={homeLink} className="mr-4 flex items-center space-x-2">
          {hasMounted && brandName && brand?.logoUrl ? (
            <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          ) : hasMounted && settings.platformLogoUrl ? (
             <Image src={settings.platformLogoUrl} alt={`${settings.platformName} Logo`} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <Logo className="h-8 w-8" />
          )}
          <span className="hidden font-bold text-lg sm:inline-block capitalize">{currentDisplayName}</span>
        </Link>

        {brandName && categories.length > 0 && (
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2">
                      <Menu className="h-5 w-5" />
                      <span className="font-semibold">Categories</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                  {categories.map(cat => (
                      <DropdownMenuItem key={cat} asChild>
                          <Link href={`/${effectiveBrandName}/products?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                      </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Search Bar */}
        <div className="flex-1 mx-4" ref={searchContainerRef}>
            <form className="relative w-full max-w-lg mx-auto" onSubmit={handleSearchSubmit}>
                <Input
                    name="search"
                    type="search"
                    placeholder="Search for anything"
                    className="h-11 w-full rounded-full pl-5 pr-12 text-base"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => searchQuery.length > 1 && setIsSuggestionsOpen(true)}
                />
                 <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                    <Search className="h-4 w-4" />
                </Button>
                 {isSuggestionsOpen && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full rounded-md bg-background border shadow-lg z-10">
                        <ul className="py-1">
                            {suggestions.map((suggestion, index) => (
                                <li 
                                    key={index}
                                    className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                                    onClick={() => executeSearch(suggestion)}
                                >
                                    <Search className="h-4 w-4 text-muted-foreground"/>
                                    <span>{searchQuery} in <span className="font-bold">{suggestion}</span></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </form>
        </div>

        {/* Actions */}
        <div className="hidden md:flex">
            <DesktopNavActions />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col p-0">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>
                            <Link href={homeLink} className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                                {hasMounted && brandName && brand?.logoUrl ? (
                                    <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                ) : hasMounted && settings.platformLogoUrl ? (
                                    <Image src={settings.platformLogoUrl} alt={`${settings.platformName} Logo`} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                    <Logo className="h-8 w-8" />
                                )}
                                <span className="font-bold text-lg capitalize">{currentDisplayName}</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="flex flex-col gap-4">
                             <Link href={`/${effectiveBrandName}/products`} className="flex items-center gap-2 font-semibold text-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                <Box className="h-5 w-5" />
                                All Products
                            </Link>
                            {user && (
                                <Link href="#" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                    <Package className="h-5 w-5" />
                                    My Orders
                                </Link>
                            )}
                            <Separator />
                            {categories.length > 0 && (
                                <>
                                <h3 className="font-semibold text-muted-foreground">Categories</h3>
                                {categories.map(cat => (
                                    <Link key={cat} href={`/${effectiveBrandName}/products?category=${encodeURIComponent(cat)}`} className="text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                        {cat}
                                    </Link>
                                ))}
                                <Separator />
                                </>
                            )}
                            <h3 className="font-semibold text-muted-foreground">Explore</h3>
                            {secondaryNavItems.map((item) => (
                                <Link key={item.label} href={item.href} className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                     <div className="border-t p-4">
                        <div className="flex items-center justify-around">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/wishlist" className="relative" onClick={() => setIsSheetOpen(false)}>
                                    <Heart className="h-6 w-6"/>
                                    {wishlistCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{wishlistCount}</span>}
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                 <Link href={`/cart`} className="relative" onClick={() => setIsSheetOpen(false)}>
                                    <ShoppingCart className="h-6 w-6" />
                                    {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{cartCount}</span>}
                                </Link>
                            </Button>
                             <UserNav />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
      
       {hasMounted && showSecondaryNav && (
        <div className="w-full overflow-x-auto no-scrollbar hidden sm:block">
            <Separator />
            <div className="container px-4 sm:px-6">
                <nav className="flex h-12 items-center gap-6">
                    {secondaryNavItems.map((item) => (
                        <Link key={item.label} href={item.href} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
       )}
    </header>
  );
}

    