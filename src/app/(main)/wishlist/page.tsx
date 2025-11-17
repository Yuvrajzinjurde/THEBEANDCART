

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from "@/hooks/use-auth";
import useUserStore from "@/stores/user-store";
import { Loader } from '@/components/ui/loader';
import { Button } from "@/components/ui/button";
import { HeartCrack, ShoppingCart, ArrowLeft, Trash, AlertCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import type { IProduct } from "@/models/product.model";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const WishlistSkeleton = () => (
    <main className="container py-8 px-4">
        <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-5 w-48 mb-6" />
        <Skeleton className="h-16 w-full mb-6" />
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <Skeleton className="w-36 h-36 rounded-lg flex-shrink-0" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-8 w-1/2 mt-2" />
                            <div className="flex items-center gap-2 mt-4 pt-4 sm:pt-0 sm:mt-auto">
                                <Skeleton className="h-10 w-36" />
                                <Skeleton className="h-10 w-28" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="mx-auto text-center">
          <p className="my-8 text-lg text-muted-foreground col-span-full">Just a moment, getting everything ready for you…</p>
        </div>
    </main>
);

export default function WishlistPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading: authLoading } = useAuth();
  const { wishlist, setWishlist, setCart } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace(`/login?redirect=${pathname}`);
        return;
      }
      setLoading(false);
    }
  }, [user, authLoading, router, pathname]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!token) return;
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
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddToCart = async (product: IProduct) => {
    if (!token) return;
    const availableStock = product.stock ?? 0;
    if (availableStock === 0) {
      toast.error("This item is out of stock.");
      return;
    }

    try {
      const cartResponse = await fetch('/api/cart', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product._id, quantity: 1, size: product.size, color: product.color }),
      });
      const cartResult = await cartResponse.json();
      if (!cartResponse.ok) throw new Error(cartResult.message);
      setCart(cartResult.cart);
      
      await handleRemoveFromWishlist(product._id as string);

    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || authLoading) {
    return <WishlistSkeleton />;
  }

  const wishlistProducts = (wishlist?.products as IProduct[]) || [];

  return (
    <main className="container py-8 px-4 flex-1">
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
            const availableStock = product.stock ?? 0;
            
            return (
                <Card key={product._id as string}>
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <Link href={`/${product.storefront}/products/${product._id}`} className="block flex-shrink-0 w-36 aspect-square">
                            <Image src={product.images[0]} alt={product.name} width={144} height={144} className="rounded-lg object-cover border w-full h-full"/>
                        </Link>
                        <div className="flex flex-col flex-grow">
                            <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                            <Link href={`/${product.storefront}/products/${product._id}`} className="font-semibold text-lg hover:underline leading-tight">{product.name}</Link>
                            
                            <Badge
                                variant={availableStock > 0 ? "default" : "destructive"}
                                className={cn("w-max mt-2", availableStock > 0 && "bg-green-100 text-green-800")}
                            >
                                {availableStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>

                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-xl font-bold text-foreground">₹{product.sellingPrice.toLocaleString('en-IN')}</p>
                                {hasDiscount && (
                                    <>
                                        <p className="font-medium text-muted-foreground line-through">₹{product.mrp!.toLocaleString('en-IN')}</p>
                                        <p className="font-semibold text-green-600">{discountPercentage}% off</p>
                                    </>
                                )}
                            </div>
                            
                             <div className="flex items-center gap-2 mt-auto pt-4 flex-wrap">
                                <Button 
                                    onClick={() => handleAddToCart(product)} 
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Move to Cart
                                </Button>
                                 <Button 
                                    variant="secondary" 
                                    onClick={() => handleRemoveFromWishlist(product._id as string)} 
                                >
                                    <Trash className="mr-2 h-4 w-4"/>
                                    Remove
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
  );
}
