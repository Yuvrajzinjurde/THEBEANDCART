
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import useUserStore from "@/stores/user-store";
import { BrandProductCard } from "@/components/brand-product-card";
import { Loader } from "@/components/ui/loader';
import { Button } from "@/components/ui/button";
import { HeartCrack, ShoppingCart, ArrowLeft, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "react-toastify";
import type { IProduct } from "@/models/product.model";
import Link from 'next/link';
import { Logo } from "@/components/logo";

const WishlistFooter = () => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="font-bold">The Brand Cart</span>
                </div>
                 <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                    <Link href="/legal/about-us" className="hover:text-primary">About Us</Link>
                    <Link href="/legal/privacy-policy" className="hover:text-primary">Policies</Link>
                    <Link href="/legal/contact-us" className="hover:text-primary">Contact Us</Link>
                </div>
                 <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
            <div className="mt-8 border-t pt-4">
                 <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} The Brand Cart. All rights reserved.</p>
            </div>
        </div>
    </footer>
);


export default function WishlistPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { wishlist, setWishlist, setCart } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/"); // Redirect to home if not logged in
        return;
      }
      setLoading(false);
    }
  }, [user, authLoading, router]);

  const handleRemoveFromWishlist = (productId: string) => {
    startTransition(async () => {
      toast.info("Removing from wishlist...");
      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setWishlist(result.wishlist);
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error.message || "Failed to update wishlist.");
      }
    });
  };

  const handleAddToCart = (product: IProduct) => {
    startTransition(async () => {
      toast.info("Adding to cart...");
      try {
        const cartResponse = await fetch('/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });
        const cartResult = await cartResponse.json();
        if (!cartResponse.ok) throw new Error(cartResult.message);
        setCart(cartResult.cart);
        toast.success("Added to cart!");

        // Then, remove from wishlist
        const wishlistRes = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ productId: product._id }),
        });
        const wishlistResult = await wishlistRes.json();
        if (!wishlistRes.ok) throw new Error(wishlistResult.message);
        setWishlist(wishlistResult.wishlist);
        toast.success("Moved to cart!");


      } catch (error: any) {
        toast.error(error.message || "Failed to process request.");
      }
    });
  };

  if (loading || authLoading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader className="h-12 w-12" />
      </main>
    );
  }

  const wishlistProducts = (wishlist?.products as IProduct[]) || [];

  return (
    <>
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Wishlist</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-6">My Wishlist ({wishlistProducts.length})</h1>
      
      {isPending && <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader/></div>}

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wishlistProducts.map((product) => (
            <div key={product._id as string} className="flex flex-col gap-2">
              <BrandProductCard product={product} />
              <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" size="sm" onClick={() => handleRemoveFromWishlist(product._id as string)} disabled={isPending}>
                    Remove
                </Button>
                <Button size="sm" onClick={() => handleAddToCart(product)} disabled={isPending}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Move to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-lg">
          <HeartCrack className="w-20 h-20 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-semibold">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Looks like you haven't added anything to your wishlist yet. Start exploring to find products you love!
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </main>
    <WishlistFooter />
    </>
  );
}

    