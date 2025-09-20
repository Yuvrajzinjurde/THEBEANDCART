
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Info } from "lucide-react";
import type { IProduct } from "@/models/product.model";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";
import useUserStore from "@/stores/user-store";
import React, { useMemo } from 'react';


interface BrandProductCardProps {
  product: IProduct;
  className?: string;
}

export function BrandProductCard({ product, className }: BrandProductCardProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { wishlist, setWishlist, setCart } = useUserStore();

  const isWishlisted = useMemo(() => {
    if (!wishlist || !wishlist.products) return false;
    const wishlistProducts = wishlist.products as (IProduct | string)[];
    return wishlistProducts.some(p => (typeof p === 'string' ? p : p._id) === product._id);
  }, [wishlist, product._id]);
  
  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        toast.info("Please log in to add items to your wishlist.");
        router.push(`/${product.storefront}/login`);
        return;
    }
    try {
        const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: product._id }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setWishlist(result.wishlist);
    } catch (error: any) {
        toast.error("Something went wrong. We apologize for the inconvenience, please try again later.");
    }
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
     if (!user) {
        toast.info("Please log in to add items to your cart.");
        router.push(`/${product.storefront}/login`);
        return;
    }
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setCart(result.cart);
    } catch (error: any) {
        toast.error("Something went wrong. We apologize for the inconvenience, please try again later.");
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Track the click - fire and forget
    fetch(`/api/products/${product._id}/track`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'clicks' }),
    }).catch(err => console.error("Failed to track click:", err));
    
    router.push(`/products/${product._id}?storefront=${product.storefront}`);
  };
  
  const sellingPrice = typeof product.sellingPrice === 'number' ? product.sellingPrice : 0;
  const mrp = typeof product.mrp === 'number' ? product.mrp : 0;
  const rating = typeof product.rating === 'number' ? product.rating : 0;
  const hasDiscount = mrp > sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const categoryDisplay = Array.isArray(product.category) ? product.category[0] : product.category;

  return (
    <Link 
      href={`/products/${product._id}?storefront=${product.storefront}`} 
      onClick={handleCardClick} 
      className={cn("group block", className)}
    >
      <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-lg flex flex-col h-full">
        <Carousel
            opts={{ loop: product.images.length > 1 }}
            className="w-full"
        >
            <CarouselContent>
            {product.images.map((img, index) => (
                <CarouselItem key={index}>
                    <div className="w-full aspect-square relative">
                        <Image
                            src={img}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </CarouselItem>
            ))}
            </CarouselContent>
        </Carousel>

        <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
                "rounded-full w-8 h-8 shadow-md hover:bg-background",
                isWishlisted ? "text-primary hover:text-primary/90" : "hover:text-red-500"
            )}
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-8 h-8 shadow-md hover:bg-background"
            onClick={handleCartClick}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-3 space-y-1.5 flex flex-col flex-grow">
          <p className="text-xs text-muted-foreground truncate">{categoryDisplay}</p>
          <div className="h-10">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>{rating.toFixed(1)}</span>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap min-h-[24px]">
            <p className="text-base font-bold text-foreground">
                ₹{sellingPrice.toLocaleString('en-IN')}
            </p>
            {hasDiscount && (
                <p className="text-sm font-medium text-muted-foreground line-through">
                    ₹{mrp.toLocaleString('en-IN')}
                </p>
            )}
          </div>
          
          <div className="h-5">
            {hasDiscount && (
                <span className="text-sm font-semibold text-green-600">
                    {discountPercentage}% off
                </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
