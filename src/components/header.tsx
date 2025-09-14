
"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Truck, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { useParams } from "next/navigation";
import type { IBrand } from "@/models/brand.model";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, loading } = useAuth();
  const params = useParams();
  const brandName = (params.brand as string) || 'reeva';
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    async function fetchBrandLogo() {
      if (!brandName) return;
      try {
        const res = await fetch(`/api/brands/${brandName}`);
        if (res.ok) {
          const { brand: brandData } = await res.json();
          setBrand(brandData);
        }
      } catch (error) {
        console.error("Failed to fetch brand data for header", error);
      }
    }
    fetchBrandLogo();
  }, [brandName]);
  
  const NavLinks = ({ className }: { className?: string}) => (
    <nav className={cn("flex items-center", className)}>
        <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
            <Link href="#">
                <Heart className="h-5 w-5" />
            </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Cart" asChild>
            <Link href="#">
                <ShoppingCart className="h-5 w-5" />
            </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Orders" asChild>
            <Link href="#">
                <Truck className="h-5 w-5" />
            </Link>
        </Button>
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href={`/${brandName}/home`} className="mr-6 flex items-center space-x-2">
          {brand?.logoUrl ? (
            <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={32} height={32} className="h-8 w-8 object-contain" />
          ) : (
            <Logo className="h-8 w-8" />
          )}
          <span className="hidden font-bold sm:inline-block capitalize">{brand?.displayName || brandName}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
                <NavLinks />
                <div className="w-px h-6 bg-border mx-2" />
                 {loading ? null : user ? (
                    <UserNav />
                    ) : (
                    <div className="flex items-center gap-2">
                        <Button asChild size="sm">
                            <Link href={`/${brandName}/login`}>Log In</Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm">
                            <Link href={`/${brandName}/signup`}>Sign Up</Link>
                        </Button>
                    </div>
                )}
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
                    <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <Link href={`/${brandName}/home`} onClick={() => setIsSheetOpen(false)} className="flex items-center space-x-2">
                                     {brand?.logoUrl ? (
                                        <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={24} height={24} className="h-6 w-6 object-contain" />
                                    ) : (
                                        <Logo className="h-6 w-6" />
                                    )}
                                    <span className="font-bold capitalize">{brand?.displayName || brandName}</span>
                                </Link>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon">
                                        <X className="h-6 w-6" />
                                    </Button>
                                </SheetClose>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                     <NavLinks className="flex-col items-start space-y-2"/>
                                </div>
                                <div className="py-4 border-t">
                                    {loading ? null : user ? (
                                        <div className="flex items-center justify-between">
                                            <span>Welcome, {user.name}</span>
                                            <UserNav />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Button asChild className="w-full" onClick={() => setIsSheetOpen(false)}>
                                                <Link href={`/${brandName}/login`}>Log In</Link>
                                            </Button>
                                            <Button asChild variant="secondary" className="w-full" onClick={() => setIsSheetOpen(false)}>
                                                <Link href={`/${brandName}/signup`}>Sign Up</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
