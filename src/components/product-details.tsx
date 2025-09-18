
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Minus, Plus, Info, ChevronUp, ChevronDown, ZoomIn, PlayCircle, ArrowLeft, ArrowRight, Tag, HelpCircle } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import type { ICoupon } from '@/models/coupon.model';
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
import { summarizeLegalDocument } from '@/ai/flows/summarize-legal-doc-flow';

interface ProductDetailsProps {
  product: IProduct;
  variants: IProduct[];
  storefront: string;
  reviewStats: ReviewStats;
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

export default function ProductDetails({ product: initialProduct, variants, storefront, reviewStats, coupons, children }: ProductDetailsProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { setCart, setWishlist } = useUserStore();
  
  const [product, setProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  
  const [returnPolicySummary, setReturnPolicySummary] = useState<string | null>(null);
  const [loadingReturnPolicy, setLoadingReturnPolicy] = useState(true);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialProduct.color);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(initialProduct.size);

  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Update product when initialProduct from props changes
  useEffect(() => {
    setProduct(initialProduct);
    setSelectedColor(initialProduct.color);
    setSelectedSize(initialProduct.size);
  }, [initialProduct]);

  // Fetch and summarize the return policy
  useEffect(() => {
    const fetchReturnPolicy = async () => {
      setLoadingReturnPolicy(true);
      try {
        const response = await fetch(`/api/legals?docType=return-policy`);
        if (response.ok) {
          const data = await response.json();
          if (data.documents.length > 0) {
            const policyContent = data.documents[0].content;
            const summaryResult = await summarizeLegalDocument({ documentContent: policyContent });
            setReturnPolicySummary(summaryResult.summary);
          }
        }
      } catch (error) {
        console.error("Failed to fetch or summarize return policy", error);
        setReturnPolicySummary("Could not load return policy summary.");
      } finally {
        setLoadingReturnPolicy(false);
      }
    };
    fetchReturnPolicy();
  }, []);

  // Memoize variant options
  const { uniqueColors, sizesForSelectedColor } = useMemo(() => {
    const colorMap = new Map<string, string>(); // color -> imageUrl
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
  
  // Navigate to the correct variant URL when color/size selection changes
  useEffect(() => {
    const variant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
    if (variant && variant._id !== product._id) {
        router.replace(`/products/${variant._id}?storefront=${storefront}`);
    } else if (!variant && selectedColor) {
      // If a color is selected but not a size yet, find the first available variant of that color
      const firstVariantOfColor = variants.find(v => v.color === selectedColor);
      if (firstVariantOfColor && firstVariantOfColor._id !== product._id) {
        router.replace(`/products/${firstVariantOfColor._id}?storefront=${storefront}`);
      }
    }
  }, [selectedColor, selectedSize, variants, product._id, router, storefront]);


  // Carousel synchronization logic
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

  // Zoom logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const mediaItems = useMemo(() => [
    ...product.images.map(url => ({ type: 'image', url })),
    // ...(product.videos?.map(url => ({ type: 'video', url })) || [])
  ], [product.images]);

  const categoryDisplay = product.category;
  const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;
  const amountSaved = hasDiscount ? product.mrp! - product.sellingPrice : 0;

  // Action Handlers
  const handleQuantityChange = (amount: number) => setQuantity((prev) => Math.max(1, prev + amount));

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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    <div className="relative">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column: Media Gallery */}
            <div className="md:sticky top-24 self-start flex flex-col gap-4 max-w-sm w-full">
                <div
                    className="relative group"
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
                                            <Image src={media.url} alt={product.name} fill className="object-cover" />
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
                </div>
                 <Carousel setApi={setThumbApi} opts={{ align: 'start', containScroll: 'keepSnaps', dragFree: true }} className="w-full">
                    <CarouselContent className="-ml-2">
                        {mediaItems.map((media, index) => (
                            <CarouselItem key={index} className="pl-2 basis-[16.66%]">
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
                 <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Quantity</h3>
                        <div className="flex items-center gap-1 rounded-lg border p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                            <span className="w-8 text-center font-semibold">{quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Button size="lg" className="h-12 text-base" onClick={handleAddToCart}><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</Button>
                        <Button size="lg" variant="secondary" className="h-12 text-base">Buy Now</Button>
                    </div>
                </div>
            </div>

            {/* Right Column: Product Info */}
            <div className="md:col-span-1 flex flex-col">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href={`/${storefront}/home`}>Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href={`/${storefront}/products?category=${categoryDisplay}`}>{categoryDisplay}</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="mt-4">
                    <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
                    <p className="text-muted-foreground mt-1">{product.brand}</p>
                </div>
                
                <div className='space-y-2 mt-4'>
                    <div className="flex items-center gap-2">
                        <Badge className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                            <span>{reviewStats.averageRating.toFixed(1)}</span>
                            <Star className="w-3 h-3 fill-white" />
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {reviewStats.totalRatings.toLocaleString()} ratings & {reviewStats.totalReviews.toLocaleString()} reviews
                        </span>
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-3xl font-bold">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                        {hasDiscount && (
                            <>
                                <span className="text-lg text-muted-foreground line-through">₹{product.mrp!.toLocaleString('en-IN')}</span>
                                <span className="text-lg font-semibold text-green-600">{discountPercentage}% off</span>
                            </>
                        )}
                    </div>
                    {hasDiscount && <p className="text-sm text-green-600">You save ₹{amountSaved.toLocaleString('en-IN')}</p>}
                </div>
            
                <Separator className="my-6" />
                
                {/* Variant Selectors */}
                {uniqueColors.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Color</h3>
                        <div className="flex flex-wrap gap-2">
                            {uniqueColors.map(({ color }) => (
                                <Button key={color} variant="outline" onClick={() => setSelectedColor(color)} className={cn("capitalize", selectedColor === color && "ring-2 ring-primary")}>{color}</Button>
                            ))}
                        </div>
                    </div>
                )}

                {sizesForSelectedColor.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizesForSelectedColor.map((size) => (
                                <Button key={size} variant="outline" size="icon" onClick={() => setSelectedSize(size)} className={cn("w-12 h-12", selectedSize === size && "ring-2 ring-primary")}>{size}</Button>
                            ))}
                        </div>
                    </div>
                )}
                {(uniqueColors.length > 0 || sizesForSelectedColor.length > 0) && <Separator className="my-6" />}
                
                {/* Offers and Policy */}
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
                        <p>{product.returnPeriod} days return policy</p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" /></TooltipTrigger>
                                <TooltipContent className="p-4 max-w-sm">
                                    {loadingReturnPolicy ? <Loader /> : returnPolicySummary ? (
                                        <div className="prose prose-sm"><div dangerouslySetInnerHTML={{ __html: returnPolicySummary }} /></div>
                                    ) : <p>Return policy not available.</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h3 className="text-base font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                {children}
            </div>
        </div>

        {/* Zoom Pane */}
        {isZooming && mediaItems[selectedIndex]?.type === 'image' && (
            <div className="absolute top-0 left-full ml-4 h-[500px] w-[400px] bg-white border rounded-lg shadow-lg hidden lg:block overflow-hidden pointer-events-none z-20">
                <Image
                    src={mediaItems[selectedIndex].url}
                    alt={`${product.name} zoomed`}
                    fill
                    className="object-cover transition-transform duration-200 ease-out"
                    style={{ transform: 'scale(2.5)', transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` }}
                />
            </div>
        )}
    </div>
  );
}
