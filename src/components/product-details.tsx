
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Minus, Plus, Info, ChevronUp, ChevronDown, ZoomIn, PlayCircle, ArrowLeft, ArrowRight, Tag, HelpCircle } from 'lucide-react';
import type { IProduct, IVariant } from '@/models/product.model';
import type { ICoupon } from '@/models/coupon.model';
import type { IReview } from '@/models/review.model';
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
import Link from 'next/link';
import { Loader } from './ui/loader';
import RatingsAndReviews from './ratings-and-reviews';

interface ProductDetailsProps {
  product: IProduct;
  storefront: string;
  reviewStats: ReviewStats;
  reviews: IReview[];
  coupons: ICoupon[];
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

export default function ProductDetails({ product: initialProduct, storefront, reviewStats, reviews, coupons, children }: ProductDetailsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuth();
  const { setCart, setWishlist } = useUserStore();
  
  const [quantity, setQuantity] = useState(1);
  
  const returnPolicySummary = `
    <ul>
      <li>Returns accepted within <strong>${initialProduct.returnPeriod || 10} days</strong> of delivery.</li>
      <li>Item must be in unused condition with original packaging.</li>
      <li>Some items like innerwear and consumables may not be returnable.</li>
    </ul>
    <p><a href="/legal/return-policy" style="color:hsl(var(--primary));">Click here for details.</a></p>
  `;

  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialProduct.color);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(initialProduct.size);

  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { uniqueColors, sizesForSelectedColor, selectedVariant } = useMemo(() => {
    const variants = initialProduct.variants || [];
    const colorMap = new Map<string, string>();
    
    variants.forEach(v => {
        if (v.color && !colorMap.has(v.color) && v.images?.[0]) {
            colorMap.set(v.color, v.images[0]);
        }
    });

    const sizesForColor = variants
        .filter(v => v.color === selectedColor && v.size)
        .map(v => v.size!);
    const uniqueSizes = Array.from(new Set(sizesForColor)).sort();

    const currentVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);

    return {
        uniqueColors: Array.from(colorMap.entries()).map(([color, imageUrl]) => ({ color, imageUrl })),
        sizesForSelectedColor: uniqueSizes,
        selectedVariant: currentVariant,
    };
}, [initialProduct.variants, selectedColor, selectedSize]);

const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const variantsForColor = initialProduct.variants?.filter(v => v.color === color) || [];
    const firstSize = variantsForColor[0]?.size;
    setSelectedSize(firstSize); // Auto-select the first available size for the new color
};

useEffect(() => {
    if (initialProduct.variants && initialProduct.variants.length > 0) {
        if (!selectedColor) {
            const firstColor = initialProduct.variants[0].color;
            if (firstColor) {
                handleColorSelect(firstColor);
            }
        }
    }
}, [initialProduct, selectedColor]);

  const onThumbClick = useCallback((index: number) => {
    mainApi?.scrollTo(index);
  }, [mainApi]);

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const newIndex = mainApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    if (thumbApi.scrollSnapList().length > newIndex) {
        thumbApi.scrollTo(newIndex);
    }
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on('select', onSelect);
    mainApi.on('reInit', onSelect);
  }, [mainApi, onSelect]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };
  
  const mediaItems = useMemo(() => {
    let images: string[] = [];
    if (selectedVariant && selectedVariant.images.length > 0) {
        images = selectedVariant.images;
    } else {
        // Fallback: If no variant is fully selected, show images for the selected color, or the main product images.
        const colorVariant = initialProduct.variants?.find(v => v.color === selectedColor);
        if (colorVariant && colorVariant.images.length > 0) {
            images = colorVariant.images;
        } else {
            images = initialProduct.images || [];
        }
    }
    return images.map(url => ({ type: 'image', url }));
}, [initialProduct.images, initialProduct.variants, selectedVariant, selectedColor]);


  const categoryDisplay = initialProduct.category;
  const hasDiscount = initialProduct.mrp && initialProduct.mrp > initialProduct.sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((initialProduct.mrp! - initialProduct.sellingPrice) / initialProduct.mrp!) * 100) : 0;
  const amountSaved = hasDiscount ? initialProduct.mrp! - initialProduct.sellingPrice : 0;
  
  const currentStock = selectedVariant ? selectedVariant.availableQuantity : initialProduct.stock;

  const handleIncreaseQuantity = () => {
    if (quantity < currentStock) {
      setQuantity(q => q + 1);
    } else {
      toast.warn(`Only ${currentStock} items available.`);
    }
  };

  const handleDecreaseQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  const handleAddToCart = async () => {
    if (!user || !token) {
        toast.info("Please log in to add items to your cart.");
        router.push(`/login?redirect=${pathname}`);
        return;
    }
    
    if ((initialProduct.variants?.length || 0) > 0 && !selectedVariant) {
        toast.warn("Please select a color and size before adding to cart.");
        return;
    }

    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              productId: initialProduct._id, 
              quantity: quantity,
              size: selectedSize,
              color: selectedColor
            }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        toast.success(`${quantity} x ${initialProduct.name} added to cart!`);
        setCart(result.cart);
    } catch (error: any) {
        throw error;
    }
  };

  const handleAddToWishlist = async () => {
     if (!user || !token) {
        toast.info("Please log in to add items to your wishlist.");
        router.push(`/login?redirect=${pathname}`);
        return;
    }
    try {
        const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: initialProduct._id }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        toast.success(result.message);
        setWishlist(result.wishlist);
    } catch (error: any) {
        toast.error(error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <div className="md:sticky top-24 self-start flex flex-col items-center">
        <div className="w-full max-w-md space-y-4">
          <div
            className="relative group w-full"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <Carousel setApi={setMainApi} opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {mediaItems.map((media, index) => (
                  <CarouselItem key={index}>
                    <div className="w-full aspect-square relative bg-muted rounded-lg overflow-hidden">
                      {media.type === 'image' ? (
                        <Image src={media.url} alt={initialProduct.name} fill className="object-cover" />
                      ) : (
                        <video src={media.url} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowLeft /></CarouselPrevious>
              <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight /></CarouselNext>
            </Carousel>
            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
              <Button variant="outline" size="icon" className="rounded-full bg-background/60 hover:bg-background hover:text-red-500" onClick={handleAddToWishlist}><Heart /></Button>
            </div>
            {isZooming && mediaItems[selectedIndex]?.type === 'image' && (
              <div className="absolute top-0 left-full ml-4 h-full w-[400px] bg-white border rounded-lg shadow-lg hidden xl:block overflow-hidden pointer-events-none z-20">
                <Image
                  src={mediaItems[selectedIndex].url}
                  alt={`${initialProduct.name} zoomed`}
                  fill
                  className="object-cover transition-transform duration-200 ease-out"
                  style={{ transform: 'scale(2.5)', transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` }}
                />
              </div>
            )}
          </div>
          <Carousel setApi={setThumbApi} opts={{ align: 'start', containScroll: 'keepSnaps', dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {mediaItems.map((media, index) => (
                <CarouselItem key={index} className="pl-2 basis-[16.66%]">
                  <ThumbsButton onClick={() => onThumbClick(index)} selected={index === selectedIndex}>
                    <Image src={media.url} alt={`${initialProduct.name} thumbnail ${index + 1}`} fill className="object-cover" />
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
           <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Quantity</h3>
                    <div className="flex items-center gap-1 rounded-lg border p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDecreaseQuantity}><Minus className="h-4 w-4" /></Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleIncreaseQuantity}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Button size="lg" className="h-12 text-base" onClick={handleAddToCart}><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</Button>
                    <Button size="lg" variant="secondary" className="h-12 text-base">Buy Now</Button>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 md:mt-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href={`/${storefront}/home`}>Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href={`/${storefront}/products?category=${categoryDisplay}`}>{categoryDisplay}</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{initialProduct.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mt-4">
          <h1 className="text-3xl lg:text-4xl font-bold">{initialProduct.name}</h1>
          <p className="text-muted-foreground mt-1">{initialProduct.brand}</p>
        </div>
        
        <div className='space-y-2 mt-4'>
             <p className="text-sm font-semibold text-primary">Special price</p>
             <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold">₹{initialProduct.sellingPrice.toLocaleString('en-IN')}</span>
                {hasDiscount && (
                    <>
                        <span className="text-lg text-muted-foreground line-through">₹{initialProduct.mrp!.toLocaleString('en-IN')}</span>
                        <span className="text-lg font-semibold text-green-600">{discountPercentage}% off</span>
                          <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="cursor-pointer" onClick={(e) => e.preventDefault()}>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="p-3 w-64">
                                    <div className="space-y-2">
                                        <p className="font-bold text-base">Price details</p>
                                        <div className="flex justify-between text-sm">
                                            <p className="text-muted-foreground">Maximum Retail Price</p>
                                            <p>₹{initialProduct.mrp!.toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <p className="text-muted-foreground">Selling Price</p>
                                            <p>₹{initialProduct.sellingPrice.toFixed(2)}</p>
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
                    </>
                )}
            </div>
             <div className="flex items-center gap-2">
                <Badge className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                    <span>{reviewStats.averageRating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 fill-white" />
                </Badge>
                <span className="text-sm text-muted-foreground">
                    {reviewStats.totalRatings.toLocaleString()} ratings &amp; {reviewStats.totalReviews.toLocaleString()} reviews
                </span>
            </div>
        </div>
    
        <Separator className="my-6" />
        
        {uniqueColors.length > 0 && (
            <div className="space-y-4 mb-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Color</h3>
                <div className="flex flex-wrap gap-3">
                    {uniqueColors.map(({ color, imageUrl }) => (
                        <TooltipProvider key={color}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleColorSelect(color)}
                                        className={cn(
                                            "relative h-10 w-10 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            selectedColor === color ? "border-primary" : "border-muted"
                                        )}
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={color}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{color}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </div>
        )}

        {sizesForSelectedColor.length > 0 && (
            <div className="space-y-4 mb-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Size</h3>
                <div className="flex flex-wrap gap-2">
                    {sizesForSelectedColor.map((size) => (
                         <Button 
                            key={size} 
                            variant={selectedSize === size ? "default" : "outline"}
                            onClick={() => setSelectedSize(size)} 
                            className={cn(
                                "w-16 h-12 text-base",
                                selectedSize === size && "shadow-md"
                            )}
                        >
                            {size}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {(uniqueColors.length > 0 || sizesForSelectedColor.length > 0) && <Separator className="my-6" />}
        
        <div className="space-y-4">
            {coupons.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-base font-semibold">Coupons for you</h3>
                    {coupons.slice(0,2).map(coupon => (
                        <div key={coupon._id as string} className="flex items-start gap-2">
                            <Tag className="h-5 w-5 mt-0.5 text-primary" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                    {coupon.type === 'percentage' && `${coupon.value}% off`}
                                    {coupon.type === 'fixed' && `₹${coupon.value} off`}
                                    {coupon.type === 'free-shipping' && 'Free Shipping'}
                                </span> on orders {coupon.minPurchase > 0 ? `above ₹${coupon.minPurchase}` : ''}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center gap-2 text-sm">
                <p>{initialProduct.returnPeriod} days return policy</p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" /></TooltipTrigger>
                        <TooltipContent className="p-4 max-w-sm">
                            <div className="prose prose-sm"><div dangerouslySetInnerHTML={{ __html: returnPolicySummary }} /></div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>

        <Separator className="my-6" />

        <div className='prose prose-sm sm:prose-base max-w-none text-muted-foreground' dangerouslySetInnerHTML={{ __html: initialProduct.description }} />

        {children}

        <Separator className="my-8" />
        
        <RatingsAndReviews 
            productId={initialProduct._id as string} 
            reviewStats={reviewStats} 
            reviews={reviews}
        />

      </div>
    </div>
  );
}
