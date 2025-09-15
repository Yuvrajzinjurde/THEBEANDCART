
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Minus, Plus, Info, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ZoomIn, PlayCircle } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';

interface ProductDetailsProps {
  product: IProduct;
}

const ThumbsButton: React.FC<React.PropsWithChildren<{
  selected: boolean
  onClick: () => void
}>> = (props) => {
  const { selected, onClick, children } = props

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative aspect-square w-full h-auto rounded-md overflow-hidden transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        selected ? 'ring-2 ring-primary ring-offset-background' : 'opacity-80 hover:opacity-100'
      )}
      type="button"
    >
        {children}
    </button>
  )
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: false,
    axis: 'y',
  });

  const onThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index)
    },
    [mainApi]
  );
  
  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return
    setSelectedIndex(mainApi.selectedScrollSnap())
    thumbApi.scrollTo(mainApi.selectedScrollSnap())
  }, [mainApi, thumbApi, setSelectedIndex]);

  useEffect(() => {
    if (!mainApi) return
    onSelect()
    mainApi.on('select', onSelect)
    mainApi.on('reInit', onSelect)
  }, [mainApi, onSelect]);


  const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi]);
  const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi]);
  
  const thumbScrollPrev = useCallback(() => thumbApi?.scrollPrev(), [thumbApi]);
  const thumbScrollNext = useCallback(() => thumbApi?.scrollNext(), [thumbApi]);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };
  
  const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;
  const amountSaved = hasDiscount ? product.mrp! - product.sellingPrice : 0;
  
  // Combine images and videos for the gallery
  const mediaItems = [
    ...product.images.map(url => ({ type: 'image', url })),
    // ...(product.videos?.map(url => ({ type: 'video', url })) || [])
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery Column */}
      <div className="grid grid-cols-[80px_1fr] items-start gap-4">
        {/* Vertical Thumbnails */}
        <div className="flex flex-col items-center">
             <Button
                variant="ghost" size="icon"
                className="h-8 w-8 flex-shrink-0 mb-3"
                onClick={thumbScrollPrev}
            ><ChevronUp className="h-5 w-5" /></Button>
            <div className="overflow-hidden w-full" ref={thumbRef}>
                <div className="flex flex-col gap-3">
                    {mediaItems.map((media, index) => (
                        <div key={index} className="flex-[0_0_80px] min-w-0">
                            <ThumbsButton
                                onClick={() => onThumbClick(index)}
                                selected={index === selectedIndex}
                            >
                                <Image
                                  src={media.url}
                                  alt={`${product.name} thumbnail ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                {media.type === 'video' && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <PlayCircle className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </ThumbsButton>
                        </div>
                    ))}
                </div>
            </div>
            <Button
                variant="ghost" size="icon"
                className="h-8 w-8 flex-shrink-0 mt-3"
                onClick={thumbScrollNext}
            ><ChevronDown className="h-5 w-5" /></Button>
        </div>
        
        {/* Main Image Viewer */}
        <div className="relative overflow-hidden rounded-lg aspect-square">
            <div className="overflow-hidden h-full" ref={mainRef}>
                 <div className="flex h-full bg-muted">
                    {mediaItems.map((media, index) => (
                        <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
                            {media.type === 'image' ? (
                                <Image
                                    src={media.url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <video
                                    src={media.url}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <Button
                variant="outline" size="icon"
                className="absolute top-1/2 -translate-y-1/2 left-2 rounded-full h-8 w-8 bg-background/60 hover:bg-background"
                onClick={scrollPrev}
            ><ChevronLeft /></Button>
            <Button
                variant="outline" size="icon"
                className="absolute top-1/2 -translate-y-1/2 right-2 rounded-full h-8 w-8 bg-background/60 hover:bg-background"
                onClick={scrollNext}
            ><ChevronRight /></Button>
             <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button variant="outline" size="icon" className="rounded-full bg-background/60 hover:bg-background hover:text-red-500">
                    <Heart />
                </Button>
                 <Button variant="outline" size="icon" className="rounded-full bg-background/60 hover:bg-background">
                    <ZoomIn />
                </Button>
            </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-4">
        <div>
            <p className="text-muted-foreground">{product.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
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
        
        <div className="flex flex-col gap-4 mt-auto pt-4">
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
                <Button size="lg" variant="secondary">
                    Buy Now
                </Button>
            </div>
        </div>
        
        <Separator />
      </div>
    </div>
  );
}

    