
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from "@/hooks/use-auth";
import useUserStore from "@/stores/user-store";
import { Loader } from '@/components/ui/loader';
import { Button } from "@/components/ui/button";
import { HeartCrack, ShoppingCart, ArrowLeft, Twitter, Facebook, Instagram, Linkedin, Trash, AlertCircle } from "lucide-react";
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
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
      if (product.stock === 0) {
        toast.error("This item is out of stock.");
        return;
      }
      toast.info("Moving to cart...");
      try {
        // Add to cart
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
        
        // Remove from wishlist
        const wishlistRes = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ productId: product._id }),
        });
        const wishlistResult = await wishlistRes.json();
        if (!wishlistRes.ok) {
            // Note: Even if removing from wishlist fails, we don't rollback the cart addition.
            // It's not a critical failure. We'll just log it.
            console.error("Failed to remove from wishlist after adding to cart:", wishlistResult.message);
        }
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

      <h1 className="text-3xl font-bold tracking-tight mb-2">My Wishlist</h1>
       <p className="text-muted-foreground mb-6">
        {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
      </p>
      
      {isPending && <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader/></div>}
      
      {wishlistProducts.length > 0 && (
        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Items are not reserved!</AlertTitle>
            <AlertDescription>
                Products in your wishlist are not held in stock for you. Shop them before they're gone!
            </AlertDescription>
        </Alert>
      )}

      {wishlistProducts.length > 0 ? (
        <div className="space-y-4">
          {wishlistProducts.map((product) => {
            const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
            const discountPercentage = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;
            return (
                <Card key={product._id as string}>
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <Link href={`/products/${product._id}?storefront=${product.storefront}`} className="block flex-shrink-0 w-36 aspect-square">
                            <Image src={product.images[0]} alt={product.name} width={144} height={144} className="rounded-lg object-cover border w-full h-full"/>
                        </Link>
                        <div className="flex flex-col flex-grow">
                            <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                            <Link href={`/products/${product._id}?storefront=${product.storefront}`} className="font-semibold text-lg hover:underline leading-tight">{product.name}</Link>
                            
                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-xl font-bold text-foreground">₹{product.sellingPrice.toLocaleString('en-IN')}</p>
                                {hasDiscount && (
                                    <>
                                        <p className="font-medium text-muted-foreground line-through">₹{product.mrp!.toLocaleString('en-IN')}</p>
                                        <p className="font-semibold text-green-600">{discountPercentage}% off</p>
                                    </>
                                )}
                            </div>
                            
                            <Badge
                                variant={product.stock > 0 ? "default" : "destructive"}
                                className={cn(
                                    "w-max mt-2",
                                    product.stock > 0 && "bg-green-100 text-green-800"
                                )}
                            >
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>

                             <div className="flex items-center gap-2 mt-4 pt-4 border-t sm:border-none sm:pt-0 sm:mt-auto">
                                <Button 
                                    className="w-full"
                                    onClick={() => handleAddToCart(product)} 
                                    disabled={isPending || product.stock === 0}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Move to Cart
                                </Button>
                                 <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-10 w-10 flex-shrink-0"
                                    onClick={() => handleRemoveFromWishlist(product._id as string)} 
                                    disabled={isPending}
                                >
                                    <Trash className="h-4 w-4"/>
                                    <span className="sr-only">Remove</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
          })}
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
