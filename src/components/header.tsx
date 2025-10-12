
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
import { Skeleton } from "./ui/skeleton";
import { NotificationsPopover } from "./notifications-drawer";

export default function Header() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { cart, wishlist } = useUserStore();
  const { settings, fetchSettings } = usePlatformSettingsStore();

  const [brandName, setBrandName] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);

  // State for search suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsClient(true);
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!isClient) return;

    const pathBrand = params.brand as string;
    const queryBrand = searchParams.get('storefront');
    
    const globalRoutes = ['/admin', '/legal', '/wishlist', '/create-hamper', '/cart', '/search', '/login', '/signup', '/forgot-password', '/dashboard'];
    const isGlobalRoute = pathname === '/' || globalRoutes.some(route => pathname.startsWith(route));

    if (isGlobalRoute) {
      setBrandName(null);
    } else {
      const determinedBrand = pathBrand || queryBrand || 'reeva';
      setBrandName(determinedBrand);
    }
  }, [pathname, params, searchParams, isClient]);

  useEffect(() => {
    if (!isClient) return;

    async function fetchBrandData() {
        setIsLoading(true);
        const url = brandName 
            ? `/api/products?storefront=${brandName}&limit=1000`
            : `/api/products?limit=2000`;
        
        try {
            const [productsRes, brandRes] = await Promise.all([
                fetch(url),
                brandName ? fetch(`/api/brands/${brandName}`) : Promise.resolve(null)
            ]);

            if (productsRes.ok) {
                const { products: productData } = await productsRes.json();
                setAllProducts(productData);
            }

            if (brandRes && brandRes.ok) {
                const { brand: brandData } = await brandRes.json();
                setBrand(brandData);
            } else {
                setBrand(null);
            }
        } catch (error) {
            console.error("Failed to fetch data for header", error);
        } finally {
            setIsLoading(false);
        }
    }

    fetchBrandData();
  }, [brandName, isClient]);


  const cartCount = cart?.items?.filter(Boolean).length ?? 0;
  const wishlistCount = wishlist?.products?.length ?? 0;
  
  const effectiveBrandName = brandName || 'reeva';
  const showSecondaryNav = pathname === `/${effectiveBrandName}/home`;


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
  
  const currentDisplayName = !isLoading && isClient && (brand && brandName ? brand.displayName : settings.platformName);
  const homeLink = brandName ? `/${brandName}/home` : '/';

  const DesktopNavActions = () => (
    <div className="flex items-center gap-1">
        {authLoading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9 rounded-full" />
            </div>
        ) : user ? (
            <>
                <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
                    <Link href="/wishlist" className="relative">
                        <Heart className="h-5 w-5" />
                        {wishlistCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{wishlistCount}</span>}
                    </Link>
                </Button>
                <NotificationsPopover />
                <UserNav />
                <Button variant="ghost" size="icon" aria-label="Cart" asChild>
                    <Link href={`/cart`} className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{cartCount}</span>}
                    </Link>
                </Button>
            </>
        ) : (
            <Button asChild><Link href={`/login?redirect=${pathname}`}>Login</Link></Button>
        )}
    </div>
  );
  
  const renderLogo = () => {
    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full" />;
    
    const logoUrl = brandName && brand?.logoUrl ? brand.logoUrl : settings.platformLogoUrl;
    
    if (logoUrl) {
      return <Image src={logoUrl} alt="Logo" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />;
    }
    
    return null;
  };

  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24 ml-4" />
            <div className="flex-1 mx-4">
                <Skeleton className="h-11 w-full max-w-lg mx-auto rounded-full" />
            </div>
            <div className="flex items-center gap-1">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9" />
            </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center">
          {/* Mobile Menu (left) */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>
                    <Link href={homeLink} className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                      {renderLogo()}
                      <span className="font-bold text-lg capitalize">{currentDisplayName}</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="flex flex-col gap-4">
                    {user && (
                      <Link href="/dashboard/orders" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
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
                  {user ? (
                    <UserNav />
                  ) : (
                    <Button asChild className="w-full"><Link href={`/login?redirect=${pathname}`}>Login</Link></Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full flex items-center gap-6">
            {/* Desktop Logo & Categories (left) */}
            <div className="hidden md:flex items-center gap-x-4">
              <Link href={homeLink} className="flex items-center space-x-2">
                {renderLogo()}
                <span className="font-bold text-lg capitalize">
                  {isLoading ? <Skeleton className="h-6 w-24" /> : currentDisplayName}
                </span>
              </Link>
              {brandName && categories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="items-center gap-2">
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
            </div>

            {/* Search Bar (center) */}
            <div className="flex-1" ref={searchContainerRef}>
              <form className="relative w-full max-w-lg mx-auto" onSubmit={handleSearchSubmit}>
                <Input
                  name="search"
                  type="search"
                  placeholder="Search for anything"
                  className="h-11 w-full rounded-full pl-5 pr-12 text-base"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.length > 1 && setIsSuggestionsOpen(true)}
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" disabled={isLoading}>
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
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span>{searchQuery} in <span className="font-bold">{suggestion}</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>

            {/* Actions (right) */}
            <div className="hidden md:flex">
              <DesktopNavActions />
            </div>
          </div>

          {/* Mobile Actions (right) */}
          <div className="md:hidden flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Cart" asChild>
              <Link href={`/cart`} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{cartCount}</span>}
              </Link>
            </Button>
            {user && <NotificationsPopover />}
          </div>
        </div>
      </div>
      
      {showSecondaryNav && (
        <div className="w-full overflow-x-auto no-scrollbar border-t">
          <div className="container">
            <nav className="flex h-12 items-center justify-center gap-6">
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
