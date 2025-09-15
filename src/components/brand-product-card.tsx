
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
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";

interface BrandProductCardProps {
  product: IProduct;
  className?: string;
}

export function BrandProductCard({ product, className }: BrandProductCardProps) {
  const router = useRouter();
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true, playOnInit: false })
  );

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Added to wishlist:", product.name);
    // TODO: Implement wishlist logic
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      }).catch(err => console.error("Failed to track click:", err));
    } finally {
      router.push(`/products/${product._id}`);
    }
  };
  
  const sellingPrice = typeof product.sellingPrice === 'number' ? product.sellingPrice : 0;
  const mrp = typeof product.mrp === 'number' ? product.mrp : 0;
  const hasDiscount = mrp > sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const amountSaved = hasDiscount ? mrp - sellingPrice : 0;

  return (
    <Link 
      href={`/products/${product._id}`} 
      onClick={handleCardClick} 
      className={cn("group block", className)}
      onMouseEnter={() => plugin.current.play()}
      onMouseLeave={() => plugin.current.stop()}
    >
      <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden xl:aspect-h-8 xl:aspect-w-7">
           <Carousel
              plugins={[plugin.current]}
              className="w-full h-full"
            >
              <CarouselContent>
                {product.images.map((img, index) => (
                  <CarouselItem key={index}>
                     <Image
                      src={img}
                      alt={`${product.name} image ${index + 1}`}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
        </div>
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-8 h-8 shadow-md hover:bg-background hover:text-red-500"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
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
        <div className="p-3 space-y-1.5">
          <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{product.category}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50"></span>
              <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{product.rating.toFixed(1)}</span>
              </div>
          </div>
          <div className="flex items-baseline gap-2 flex-nowrap">
            <p className="text-base font-bold text-foreground">
                ₹{sellingPrice.toLocaleString('en-IN')}
            </p>
            {hasDiscount && (
              <>
                <p className="text-sm font-medium text-muted-foreground line-through">
                    ₹{mrp.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-green-600 whitespace-nowrap">{discountPercentage}% off</span>
                  <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <button className="cursor-pointer" onClick={(e) => e.preventDefault()}>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                              </button>
                          </TooltipTrigger>
                          <TooltipContent className="p-3 w-56">
                              <div className="space-y-2">
                                  <p className="font-bold text-sm">Price details</p>
                                  <div className="flex justify-between text-xs">
                                      <p>MRP</p>
                                      <p>₹{mrp.toFixed(2)}</p>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <p>Selling Price</p>
                                      <p>₹{sellingPrice.toFixed(2)}</p>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between text-xs font-semibold text-green-600">
                                     <p>Overall savings</p>
                                     <p>₹{amountSaved.toFixed(2)}</p>
                                  </div>
                              </div>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
