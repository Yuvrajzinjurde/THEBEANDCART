
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { IProduct } from "@/models/product.model";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: IProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
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

  return (
    <Link href={`/products/${product._id}`} className={cn("group block", className)}>
      <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden xl:aspect-h-8 xl:aspect-w-7">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-2 top-2 z-10 flex -translate-x-12 flex-col gap-2 transition-transform duration-300 group-hover:translate-x-0">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full bg-background/60 backdrop-blur-sm hover:bg-background"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full bg-background/60 backdrop-blur-sm hover:bg-background"
            onClick={handleCartClick}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="truncate text-base font-semibold text-foreground">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
          <p className="mt-2 text-lg font-bold text-foreground">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
