
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Minus, Plus, Info } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from './ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ProductDetailsProps {
  product: IProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };
  
  const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;
  const amountSaved = hasDiscount ? product.mrp! - product.sellingPrice : 0;

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="grid gap-4">
        <div className="relative overflow-hidden rounded-lg border aspect-square">
            <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
            />
        </div>
        <div className="hidden md:grid grid-cols-4 gap-4">
          {product.images.map((img, index) => (
            <button
              key={index}
              className={cn(
                "overflow-hidden rounded-lg border aspect-square transition",
                selectedImage === img ? 'ring-2 ring-primary' : 'hover:border-primary'
              )}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
         <div className="md:hidden">
            <Carousel>
                <CarouselContent>
                    {product.images.map((img, index) => (
                        <CarouselItem key={index} className="basis-1/3">
                            <button
                                className={cn(
                                    "overflow-hidden rounded-lg border aspect-square transition w-full",
                                    selectedImage === img ? 'ring-2 ring-primary' : 'hover:border-primary'
                                )}
                                onClick={() => setSelectedImage(img)}
                                >
                                <Image
                                    src={img}
                                    alt={`${product.name} thumbnail ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">{product.brand}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-5 h-5", i < Math.round(product.rating) ? 'fill-current' : 'text-muted-foreground/50')} />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.rating.toFixed(1)})</span>
        </div>

        <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
            {hasDiscount && (
                <>
                    <span className="text-lg text-muted-foreground line-through">₹{product.mrp!.toLocaleString('en-IN')}</span>
                    <span className="text-lg font-semibold text-green-600">{discountPercentage}% off</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button className="cursor-pointer">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="p-4 w-64">
                                <div className="space-y-3">
                                    <p className="font-bold text-base">Price details</p>
                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <p>Maximum Retail Price</p>
                                            <p className="text-xs text-muted-foreground">(incl. of all taxes)</p>
                                        </div>
                                        <p>₹{product.mrp!.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <p>Selling Price</p>
                                        <p>₹{product.sellingPrice.toFixed(2)}</p>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm font-semibold text-green-600">
                                       <p>Overall you save ₹{amountSaved.toFixed(2)} ({discountPercentage}%) on this product</p>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </>
            )}
        </div>
        
        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        <Separator />
        
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Quantity</h3>
                <div className="flex items-center gap-2 rounded-lg border p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <div className="grid sm:grid-cols-2 gap-4">
                <Button size="lg" >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                    <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
