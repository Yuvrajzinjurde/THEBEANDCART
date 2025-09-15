
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { IProduct } from "@/models/product.model";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: IProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Added to wishlist:", product.name);
    // TODO: Implement wishlist logic
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Added to cart:", product.name);
    // TODO: Implement cart logic
  };

  const handleCardClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      // Track the click - fire and forget
      fetch(`/api/products/${product._id}/track`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'clicks' }),
      });
    } catch (error) {
      console.error("Failed to track click:", error);
    } finally {
      // Navigate after attempting to track
      router.push(`/products/${product._id}`);
    }
  };
  
  const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;

  return (
    <Link href={`/products/${product._id}`} onClick={handleCardClick} className={cn("group block", className)}>
      <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
         {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                {discountPercentage}% OFF
            </Badge>
        )}
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden xl:aspect-h-8 xl:aspect-w-7">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute bottom-2 right-2 z-10 flex translate-x-12 flex-col gap-1 transition-transform duration-300 group-hover:translate-x-0">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full bg-background/60 w-8 h-8 backdrop-blur-sm hover:bg-background hover:text-red-500"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full bg-background/60 w-8 h-8 backdrop-blur-sm hover:bg-background"
            onClick={handleCartClick}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-3">
          <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-base font-bold text-foreground">
                ₹{product.sellingPrice.toFixed(2)}
            </p>
            {hasDiscount && (
                <p className="text-sm font-medium text-muted-foreground line-through">
                    ₹{product.mrp!.toFixed(2)}
                </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
