
"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Menu, X, Search, Gift, Shirt, Home as HomeIcon, User, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IBrand } from "@/models/brand.model";
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

export default function Header() {
  const { user } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [showSecondaryNav, setShowSecondaryNav] = useState(false);
  const { cart, wishlist } = useUserStore();

  const [brandName, setBrandName] = useState<string | null>(null);

  useEffect(() => {
    // This logic now runs only on the client, avoiding server-client mismatch
    const pathBrand = params.brand as string;
    const queryBrand = searchParams.get('storefront');
    const isCreateHamperPage = pathname === '/create-hamper';
    const determinedBrandName = isCreateHamperPage ? null : (pathBrand || queryBrand || 'reeva');
    setBrandName(determinedBrandName);

    if (pathname === `/${determinedBrandName}/home`) {
      setShowSecondaryNav(true);
    } else {
      setShowSecondaryNav(false);
    }
  }, [pathname, params, searchParams]);


  const cartCount = cart?.items?.filter(Boolean).length ?? 0;
  const wishlistCount = wishlist?.products?.length ?? 0;
  
  const effectiveBrandName = brandName || 'reeva';

  const secondaryNavItems = [
    { href: `/${effectiveBrandName}/products?keyword=gift`, icon: Gift, label: "Gifts" },
    { href: `/${effectiveBrandName}/products?keyword=fashion`, icon: Shirt, label: "Fashion Finds" },
    { href: `/${effectiveBrandName}/products?keyword=home`, icon: HomeIcon, label: "Home Favourites" },
  ];
  
  const categories = brand?.categories || [];

  useEffect(() => {
    async function fetchBrandLogo() {
      if (!brandName) {
        setBrand(null);
        return;
      };
      try {
        const res = await fetch(`/api/brands/${brandName}`);
        if (res.ok) {
          const { brand: brandData } = await res.json();
          setBrand(brandData);
        } else {
          setBrand(null); // Explicitly set to null if brand not found
        }
      } catch (error) {
        console.error("Failed to fetch brand data for header", error);
        setBrand(null);
      }
    }
    fetchBrandLogo();
  }, [brandName]);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
    if (query) {
      router.push(`/${effectiveBrandName}/products?keyword=${encodeURIComponent(query)}`);
      setIsSheetOpen(false);
    }
  };

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
            <Link href={`/${effectiveBrandName}/cart`} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{cartCount}</span>}
            </Link>
        </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href={brandName ? `/${brandName}/home` : '/'} className="mr-4 flex items-center space-x-2">
          {brand?.logoUrl ? (
            <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <Logo className="h-8 w-8" />
          )}
          <span className="hidden font-bold text-lg sm:inline-block capitalize">{brand?.displayName || 'The Brand Cart'}</span>
        </Link>

        {/* Categories Dropdown */}
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

        {/* Search Bar */}
        <div className="flex-1 mx-4">
            <form className="relative w-full max-w-lg mx-auto" onSubmit={handleSearch}>
                <Input
                    name="search"
                    type="search"
                    placeholder="Search for anything"
                    className="h-11 w-full rounded-full pl-5 pr-12 text-base"
                />
                 <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                    <Search className="h-4 w-4" />
                </Button>
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
                            <Link href={brandName ? `/${brandName}/home`: '/'} className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                                <Logo className="h-8 w-8" />
                                <span className="font-bold text-lg capitalize">{brand?.displayName || 'The Brand Cart'}</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="flex flex-col gap-4">
                            <form className="relative w-full" onSubmit={handleSearch}>
                                <Input name="search" type="search" placeholder="Search..." className="pr-10" />
                                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full w-10">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <Separator />
                            <h3 className="font-semibold text-muted-foreground">Categories</h3>
                             {categories.map(cat => (
                                <Link key={cat} href={`/${effectiveBrandName}/products?category=${encodeURIComponent(cat)}`} className="text-muted-foreground hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                                    {cat}
                                </Link>
                            ))}
                            <Separator />
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
                                 <Link href={`/${effectiveBrandName}/cart`} className="relative" onClick={() => setIsSheetOpen(false)}>
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
      
       <div className={cn(!showSecondaryNav && "hidden")}>
          <Separator />
          <div className="md:hidden overflow-x-auto">
             <nav className="container flex items-center gap-6 px-4 sm:px-6 h-12">
                  {secondaryNavItems.map((item) => (
                      <Link key={item.label} href={item.href} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                      </Link>
                  ))}
              </nav>
          </div>
          <div className="hidden md:flex justify-center">
              <nav className="container flex items-center justify-center gap-6 px-4 sm:px-6 lg:px-8 h-12">
                  {secondaryNavItems.map((item) => (
                      <Link key={item.label} href={item.href} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                      </Link>
                  ))}
              </nav>
          </div>
      </div>
    </header>
  );
}
