

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Minus, Plus, Info, ChevronUp, ChevronDown, ZoomIn, PlayCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'react-toastify';
import useUserStore from '@/stores/user-store';
import { Badge } from './ui/badge';
import type { ReviewStats } from '@/app/api/reviews/[productId]/stats/route';

interface ProductDetailsProps {
  product: IProduct;
  variants: IProduct[];
  storefront: string;
  reviewStats: ReviewStats;
  children?: React.ReactNode;
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

export default function ProductDetails({ product: initialProduct, variants, storefront, reviewStats, children }: ProductDetailsProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { setCart, setWishlist } = useUserStore();
  const [product, setProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.color);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.size);

  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };


  // Update product when initialProduct changes
  useEffect(() => {
      setProduct(initialProduct);
      setSelectedColor(initialProduct.color);
      setSelectedSize(initialProduct.size);
  }, [initialProduct]);

  const { uniqueColors, sizesForSelectedColor } = useMemo(() => {
    const colorMap = new Map<string, string>(); // color -> image
    const sizeSet = new Set<string>();
    
    variants.forEach(v => {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, v.images[0]);
      }
      if (v.color === selectedColor && v.size) {
        sizeSet.add(v.size);
      }
    });

    return {
      uniqueColors: Array.from(colorMap.entries()).map(([color, imageUrl]) => ({ color, imageUrl })),
      sizesForSelectedColor: Array.from(sizeSet).sort(),
    };
  }, [variants, selectedColor]);
  
  // Navigate to the correct variant URL when color/size changes
  useEffect(() => {
    if (!selectedColor && !selectedSize) return;

    const variant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
    if (variant && variant._id !== product._id) {
        // Use replace to avoid polluting browser history for variant selection
        router.replace(`/products/${variant._id}?storefront=${storefront}`);
    } else if (!variant && selectedColor) {
      // If a color is selected but not a size yet, find the first available size for that color
      const firstVariantOfColor = variants.find(v => v.color === selectedColor);
      if (firstVariantOfColor && firstVariantOfColor._id !== product._id) {
        router.replace(`/products/${firstVariantOfColor._id}?storefront=${storefront}`);
      }
    }
  }, [selectedColor, selectedSize, variants, product._id, router, storefront]);


  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return
      mainApi.scrollTo(index)
    },
    [mainApi]
  )

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return
    const newIndex = mainApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    thumbApi.scrollTo(newIndex);
  }, [mainApi, thumbApi])


  useEffect(() => {
    if (!mainApi) {
      return
    }
    onSelect()
    mainApi.on('select', onSelect)
    mainApi.on('reInit', onSelect)
  }, [mainApi, onSelect])


  const thumbScrollPrev = useCallback(() => thumbApi?.scrollPrev(), [thumbApi]);
  const thumbScrollNext = useCallback(() => thumbApi?.scrollNext(), [thumbApi]);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };
  
  const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;
  const amountSaved = hasDiscount ? product.mrp! - product.sellingPrice : 0;
  
  const mediaItems = [
    ...product.images.map(url => ({ type: 'image', url })),
    // ...(product.videos?.map(url => ({ type: 'video', url })) || [])
  ];
  
  const handleAddToCart = async () => {
    if (!user) {
        toast.info("Please log in to add items to your cart.");
        router.push(`/${storefront}/login`);
        return;
    }
    toast.info("Adding to cart...");
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: product._id, quantity }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setCart(result.cart);
        toast.success("Added to cart!");
    } catch (error: any) {
        toast.error(error.message || "Failed to add to cart.");
    }
  };

  const handleAddToWishlist = async () => {
     if (!user) {
        toast.info("Please log in to add items to your wishlist.");
        router.push(`/${storefront}/login`);
        return;
    }
    toast.info("Updating wishlist...");
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
        toast.success(result.message);
    } catch (error: any) {
        toast.error(error.message || "Failed to update wishlist.");
    }
  };


  return (
    <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
      {/* Left Column: Image Gallery */}
      <div className="md:col-span-2 relative">
         <div className="md:sticky top-24 self-start">
            <div 
              className="relative overflow-hidden group max-h-[350px]"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
                <Carousel setApi={setMainApi} opts={{ loop: true }} className="w-full rounded-lg">
                <CarouselContent>
                    {mediaItems.map((media, index) => (
                    <CarouselItem key={index}>
                        <div 
                          className="w-full aspect-square relative bg-muted rounded-lg overflow-hidden cursor-crosshair"
                        >
                        {media.type === 'image' ? (
                            <Image src={media.url} alt={product.name} fill className="object-cover" />
                        ) : (
                            <video src={media.url} controls className="w-full h-full object-cover" />
                        )}
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowLeft /></CarouselPrevious>
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight /></CarouselNext>
                </Carousel>
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                <Button variant="outline" size="icon" className="rounded-full bg-background/60 hover:bg-background hover:text-red-500" onClick={handleAddToWishlist}><Heart /></Button>
                </div>
                 {isZooming && mediaItems[selectedIndex]?.type === 'image' && (
                    <div
                        className="absolute top-0 left-full ml-4 h-full w-[500px] bg-white border rounded-lg shadow-lg hidden md:block overflow-hidden pointer-events-none z-20"
                    >
                    <Image
                        src={mediaItems[selectedIndex].url}
                        alt={`${product.name} zoomed`}
                        fill
                        className="object-cover transition-transform duration-200 ease-out"
                        style={{
                        transform: 'scale(2.5)',
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        }}
                    />
                    </div>
                )}
            </div>
            <Carousel setApi={setThumbApi} opts={{ align: 'start', containScroll: 'keepSnaps', dragFree: true }} className="w-full mt-4">
                <CarouselContent className="-ml-2">
                {mediaItems.map((media, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/4 md:basis-1/5">
                    <ThumbsButton onClick={() => onThumbClick(index)} selected={index === selectedIndex}>
                        <Image src={media.url} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                        {media.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                        )}
                    </ThumbsButton>
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
             <div className='space-y-4 pt-4 border-t mt-4'>
                <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Quantity</h3>
                <div className="flex items-center gap-1 rounded-lg border p-1">
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
                    <Button size="lg" className="h-12 text-base" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                    </Button>
                    <Button size="lg" variant="secondary" className="h-12 text-base">
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
      </div>

        {/* Right Column: Product Info */}
        <div className="md:col-span-3 flex flex-col gap-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${storefront}/home`}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${storefront}/products?category=${product.category}`}>{product.category}</BreadcrumbLink>
                </BreadcrumbItem>
                 <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
          <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
              <div>
                <p className="text-muted-foreground">{product.brand}</p>
                {hasDiscount && (
                    <Badge variant="outline" className="text-green-600 border-green-600 mt-2">Special Price</Badge>
                )}
                <div className="flex items-baseline gap-3 mt-1">
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
                 <div className="flex items-center gap-2 mt-2">
                    <Badge className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                        <span>{reviewStats.averageRating.toFixed(1)}</span>
                        <Star className="w-3 h-3 fill-white" />
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        {reviewStats.totalRatings.toLocaleString()} ratings and {reviewStats.totalReviews.toLocaleString()} reviews
                    </span>
                </div>
              </div>
          </div>
          
          <Separator />
            
          {uniqueColors.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Color</h3>
                <div className="flex flex-wrap gap-2">
                    {uniqueColors.map(({ color }) => (
                         <Button 
                            key={color} 
                            variant="outline"
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                                "capitalize",
                                selectedColor === color && "ring-2 ring-primary"
                            )}
                         >{color}</Button>
                    ))}
                </div>
            </div>
          )}

          {sizesForSelectedColor.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizesForSelectedColor.map((size) => (
                   <Button 
                        key={size}
                        variant="outline" 
                        size="icon"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                            "w-12 h-12",
                            selectedSize === size && "ring-2 ring-primary"
                        )}
                    >{size}</Button>
                ))}
              </div>
            </div>
          )}
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
          {children}
        </div>
    </div>
  );
}
