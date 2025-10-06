
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Info, Plus, Minus } from "lucide-react";
import type { IProduct } from "@/models/product.model";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";
import useUserStore from "@/stores/user-store";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";


interface BrandProductCardProps {
  product: IProduct;
  className?: string;
}

export function BrandProductCard({ product, className }: BrandProductCardProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { wishlist, setWishlist, setCart } = useUserStore();
  const [api, setApi] = useState<CarouselApi>();
  const [quantity, setQuantity] = useState(1);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  // Each card needs its own instance of the autoplay plugin.
  const autoplayPlugin = useRef(
    Autoplay({ delay: 1000, stopOnInteraction: false, playOnInit: false })
  );

  useEffect(() => {
    const carouselEl = carouselRef.current;
    if (!carouselEl) return;

    const startAutoplay = () => autoplayPlugin.current.play();
    const stopAutoplay = () => autoplayPlugin.current.stop();

    carouselEl.addEventListener('mouseenter', startAutoplay);
    carouselEl.addEventListener('mouseleave', stopAutoplay);

    return () => {
      if (carouselEl) {
        carouselEl.removeEventListener('mouseenter', startAutoplay);
        carouselEl.removeEventListener('mouseleave', stopAutoplay);
      }
    }
  }, []);
  

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
        router.push(`/login`);
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
        router.push(`/login`);
        return;
    }
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: product._id, quantity: quantity }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        toast.success(`${quantity} x ${product.name} added to cart!`);
        setCart(result.cart);
    } catch (error: any) {
        toast.error("Something went wrong. We apologize for the inconvenience, please try again later.");
    }
  };
  
  const handleQuantityChange = (e: React.MouseEvent, amount: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => Math.max(1, prev + amount));
  }

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    fetch(`/api/products/${product._id}/track`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'clicks' }),
    }).catch(err => console.error("Failed to track click:", err));
    
    router.push(`/${product.storefront}/products/${product._id}`);
  };
  
  const sellingPrice = typeof product.sellingPrice === 'number' ? product.sellingPrice : 0;
  const mrp = typeof product.mrp === 'number' ? product.mrp : 0;
  const rating = typeof product.rating === 'number' ? product.rating : 0;
  const hasDiscount = mrp > sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const amountSaved = hasDiscount ? mrp - sellingPrice : 0;
  const categoryDisplay = Array.isArray(product.category) ? product.category[0] : product.category;

  return (
    <Link 
      href={`/${product.storefront}/products/${product._id}`} 
      onClick={handleCardClick} 
      className={cn("group block w-full", className)}
    >
      <motion.div 
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 group-hover:shadow-lg flex flex-col h-full"
        ref={carouselRef}
      >
        <div className="w-full">
            <Carousel
                setApi={setApi}
                plugins={[autoplayPlugin.current]}
                opts={{ loop: product.images.length > 1 }}
                className="w-full h-full"
            >
                <CarouselContent className="h-full">
                {product.images.map((img, index) => (
                    <CarouselItem key={index} className="h-full">
                        <div className="w-full aspect-square relative">
                            <Image
                                src={img}
                                alt={`${product.name} image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300"
                            />
                        </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
        </div>

        <Button
            size="icon"
            variant="secondary"
            className={cn(
                "absolute top-2 right-2 rounded-full w-8 h-8 shadow-md hover:bg-background z-10",
                "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                isWishlisted ? "text-primary hover:text-primary/90" : "hover:text-red-500"
            )}
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </Button>

        <div className="p-3 flex flex-col flex-grow">
            <div className="flex-grow space-y-1">
                <p className="text-xs text-muted-foreground truncate">{categoryDisplay}</p>
                <h3 className="text-sm font-semibold text-foreground leading-tight truncate h-5">{product.name}</h3>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                </div>

                <div className="flex items-baseline gap-x-2 flex-wrap">
                    <p className="text-base font-bold text-foreground">
                        ₹{sellingPrice.toLocaleString('en-IN')}
                    </p>
                    {hasDiscount && (
                        <p className="text-xs font-medium text-muted-foreground line-through">
                            ₹{mrp.toLocaleString('en-IN')}
                        </p>
                    )}
                </div>
              
                <div className="min-h-[16px]">
                    {hasDiscount && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-green-600">
                                {discountPercentage}% off
                            </span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="cursor-pointer" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="p-3 w-64" side="top" align="center">
                                        <div className="space-y-2">
                                            <p className="font-bold text-base">Price details</p>
                                            <div className="flex justify-between text-sm">
                                                <p className="text-muted-foreground">Maximum Retail Price</p>
                                                <p>₹{mrp.toFixed(2)}</p>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <p className="text-muted-foreground">Selling Price</p>
                                                <p>₹{sellingPrice.toFixed(2)}</p>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-sm font-semibold text-green-600">
                                            <p>Overall you save</p>
                                            <p>₹{amountSaved.toFixed(2)} ({discountPercentage}%)</p>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-full border bg-background">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={(e) => handleQuantityChange(e, -1)}><Minus className="h-4 w-4" /></Button>
                    <span className="w-5 text-center font-semibold text-sm">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={(e) => handleQuantityChange(e, 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button size="sm" className="h-8 flex-grow" onClick={handleCartClick}>
                <ShoppingCart className="h-4 w-4 mr-2"/> Add
                </Button>
            </div>
        </div>
      </motion.div>
    </Link>
  );
}
