
"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { useParams } from "next/navigation";
import type { IBrand } from "@/models/brand.model";

export default function Header() {
  const { user, loading } = useAuth();
  const params = useParams();
  const brandName = (params.brand as string) || 'reeva';
  const [brand, setBrand] = useState<IBrand | null>(null);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href={`/${brandName}/home`} className="mr-6 flex items-center space-x-2">
          {brand?.logoUrl ? (
            <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={40} height={40} className="h-10 w-10 object-contain" />
          ) : (
            <Logo className="h-8 w-8" />
          )}
          <span className="hidden font-bold sm:inline-block capitalize">{brand?.displayName || brandName}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Orders">
                <Truck className="h-5 w-5" />
            </Button>
            
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
          </nav>
        </div>
      </div>
    </header>
  );
}
