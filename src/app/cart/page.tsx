

"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import useUserStore from "@/stores/user-store";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trash2,
  Heart,
  Tag,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Gift,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import type { IProduct } from "@/models/product.model";
import type { IBrand } from "@/models/brand.model";
import type { ICartItem } from "@/models/cart.model";
import { addDays, format } from 'date-fns';
import { CartProgressBar } from "@/components/cart-progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils";

const HiddenScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={cn("h-full w-full rounded-[inherit]", "no-scrollbar")}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar className="hidden"/>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
HiddenScrollArea.displayName = "HiddenScrollArea"

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName


const SHIPPING_COST = 50;
const FREE_SHIPPING_THRESHOLD = 399;
const EXTRA_DISCOUNT_THRESHOLD = 799;
const FREE_GIFT_THRESHOLD = 999;
const EXTRA_DISCOUNT_PERCENTAGE = 0.10; // 10%

const freeGiftProduct: IProduct = {
    _id: 'free-gift-id',
    name: 'Surprise Gift',
    brand: 'From us, to you!',
    images: [''],
    sellingPrice: 0,
    mrp: 999,
    storefront: 'reeva',
    category: 'Gift',
    description: '',
    stock: 1,
    rating: 5,
    views: 0,
    clicks: 0,
    keywords: [],
    returnPeriod: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
} as IProduct;

const GiftBoxIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
        <rect x="20" y="45" width="60" height="30" rx="3" fill="currentColor" fillOpacity="0.9"/>
        <path d="M50 45V75" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <rect x="20" y="30" width="60" height="15" rx="3" fill="currentColor"/>
        <path d="M30 30H70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 10C40 10 30 20 30 30H50V10Z" fill="currentColor"/>
        <path d="M50 10C60 10 70 20 70 30H50V10Z" fill="currentColor"/>
    </svg>
)

const CartSkeleton = () => (
    <>
     <div className="sticky top-16 z-20 w-full bg-background/95 py-2 backdrop-blur-sm">
        <div className="container flex items-center justify-between gap-4 px-5">
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-32 hidden sm:block" />
            </div>
            <div className="flex-grow flex justify-center">
                <Skeleton className="h-16 w-full max-w-lg" />
            </div>
            <div className="w-48 hidden lg:block" />
        </div>
      </div>
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-lg" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-5 w-1/2" />
                                    <Skeleton className="h-4 w-1/3 mt-2" />
                                    <div className="flex justify-between mt-4">
                                        <Skeleton className="h-8 w-24 rounded-full" />
                                        <div className="flex gap-4">
                                            <Skeleton className="h-5 w-20" />
                                            <Skeleton className="h-5 w-28" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
                        <CardContent className="flex gap-2">
                            <Skeleton className="h-10 flex-grow" />
                            <Skeleton className="h-10 w-20" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Separator />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-12 w-full mt-4" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </main>
    </>
);

const ExploreBrands = () => {
    const [brands, setBrands] = useState<IBrand[]>([]);

    useEffect(() => {
        async function fetchBrands() {
            try {
                const response = await fetch('/api/brands');
                if (response.ok) {
                    const data = await response.json();
                    setBrands(data.brands);
                }
            } catch (error) {
                console.error("Failed to fetch brands for exploration", error);
            }
        }
        fetchBrands();
    }, []);

    if (brands.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Explore Our Brands</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-2 gap-4">
                    {brands.map(brand => (
                         <Link key={brand.permanentName} href={`/${brand.permanentName}/home`} className="block group">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-20 h-20 relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300">
                                    <Image
                                        src={brand.logoUrl}
                                        alt={`${brand.displayName} Logo`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <p className="text-sm font-semibold text-center truncate w-24">{brand.displayName}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading, token } = useAuth();
  const { cart, setCart, setWishlist } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace(`/login`);
        return;
      }
      setLoading(false);
    }
  }, [user, authLoading, router]);
  
  const subtotal = useMemo(() =>
    cart?.items?.reduce((acc, item) => {
        const product = item.productId as IProduct;
        if (!product) return acc;
        return acc + product.sellingPrice * item.quantity;
    }, 0) || 0,
    [cart]
  );

  const cartItems = useMemo(() => {
    if (!cart || !cart.items) return [];
    
    const items = cart.items
        ?.filter((item): item is ICartItem & { productId: IProduct } => !!item.productId)
        .map((item) => ({
          ...item,
          product: item.productId,
        }));
    
    if (subtotal >= FREE_GIFT_THRESHOLD) {
        items.push({
            productId: 'free-gift-id' as any,
            quantity: 1,
            size: undefined,
            color: undefined,
            product: freeGiftProduct
        });
    }
    return items;
  }, [cart, subtotal]);

  const handleQuantityChange = async (productId: string, newQuantity: number, size?: string, color?: string) => {
    if (newQuantity < 1) return;
    if (!token) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: newQuantity, size, color }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCart(result.cart);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCart(result.cart);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMoveToWishlist = async (productId: string) => {
    if (!token) return;
    try {
      const wishlistRes = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ productId }),
      });
      const wishlistResult = await wishlistRes.json();
      if (!wishlistRes.ok) throw new Error(wishlistResult.message);
      setWishlist(wishlistResult.wishlist);
      await handleRemoveItem(productId);

    } catch (error: any) {
      toast.error(error.message);
    }
  };


  const totalDiscount = useMemo(() =>
    cart?.items?.reduce((acc, item) => {
      const product = item.productId as IProduct;
      const mrp = product.mrp || product.sellingPrice;
      return acc + (mrp - product.sellingPrice) * item.quantity;
    }, 0) || 0,
    [cart]
  );
  
  const milestoneDiscount = useMemo(() => {
    if (subtotal >= EXTRA_DISCOUNT_THRESHOLD) {
      return subtotal * EXTRA_DISCOUNT_PERCENTAGE;
    }
    return 0;
  }, [subtotal]);
  
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const grandTotal = subtotal - milestoneDiscount + shipping;
  
  const deliveryDate = format(addDays(new Date(), 5), 'EEE, MMM d');

  const handleCheckout = async () => {
    if (!user || !token) {
      toast.error("Please log in to proceed.");
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: grandTotal }),
      });
      const { order } = await res.json();
      
      if (!order) {
        throw new Error("Could not create payment order.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "The Brand Cart",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response: any) {
          toast.success("Payment Successful!");
          router.push('/order-confirmation');
        },
        prefill: {
          name: user.name,
          email: (user as any).email,
        },
        theme: {
          color: "#3399cc"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Checkout failed", error);
      toast.error(error.message);
    }
  };


  if (loading || authLoading) {
    return <CartSkeleton />;
  }
  
  if (cartItems.length === 0) {
      return (
        <main className="container py-8 px-10 flex-1">
            <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-lg">
                <ShoppingCart className="w-20 h-20 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Add items you want to buy to your cart.
                </p>
                <Button asChild className="mt-6">
                    <Link href={`/`}>Continue Shopping</Link>
                </Button>
            </div>
        </main>
      );
  }

  return (
    <>
      <div className="sticky top-16 z-20 w-full bg-background/95 py-2 backdrop-blur-sm">
        <div className="container flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5">
            <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-2">
                    <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.back()}
                    >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                    </Button>
                    <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink href={`/`}>Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="lg:hidden w-48" />
            </div>
            <div className="flex-grow flex justify-center w-full">
                <CartProgressBar currentValue={subtotal} />
            </div>
            <div className="w-48 hidden lg:block" />
        </div>
      </div>

      <main className="py-8 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 lg:gap-8 lg:items-start">
                <div className="lg:col-span-7 xl:col-span-8">
                    <HiddenScrollArea className="h-auto lg:h-[600px] lg:pr-6">
                        <Card className="border-none shadow-none">
                            <CardHeader>
                                <CardTitle>My Cart ({cartItems.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y p-0">
                                {cartItems.map(item => {
                                    const isGift = item.product._id === 'free-gift-id';
                                    const hasDiscount = item.product.mrp && item.product.mrp > item.product.sellingPrice;
                                    const discountPercentage = hasDiscount ? Math.round(((item.product.mrp! - item.product.sellingPrice) / item.product.mrp!) * 100) : 0;
                                    return (
                                    <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex flex-row gap-4 py-6 first:pt-0">
                                        <div className="flex flex-col items-center w-24 sm:w-28 flex-shrink-0">
                                            <div className="block flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                                                {isGift ? (
                                                    <div className="w-full h-full p-4 bg-muted/30 rounded-lg flex items-center justify-center">
                                                        <GiftBoxIcon />
                                                    </div>
                                                ) : (
                                                    <Link href={`/${item.product.storefront}/products/${item.product._id}`} className="block h-full w-full">
                                                        <Image src={item.product.images[0]} alt={item.product.name} width={120} height={120} className="rounded-lg object-cover border h-full w-full"/>
                                                    </Link>
                                                )}
                                            </div>
                                            {!isGift && (
                                                <div className="flex items-center gap-1 rounded-full border p-1 mt-2">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleQuantityChange(item.product._id as string, item.quantity - 1, item.size, item.color)}><Minus className="h-4 w-4" /></Button>
                                                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleQuantityChange(item.product._id as string, item.quantity + 1, item.size, item.color)}><Plus className="h-4 w-4" /></Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-grow gap-1">
                                            <p className="text-sm text-muted-foreground font-medium">{item.product.brand}</p>
                                            <Link href={isGift ? '#' : `/${item.product.storefront}/products/${item.product._id}`} className={`font-semibold text-base sm:text-lg hover:underline leading-tight ${isGift ? 'pointer-events-none' : ''}`}>{item.product.name}</Link>
                                            
                                            {isGift && (
                                                <div className="flex items-start gap-2 p-2 rounded-md bg-green-50 text-green-700 border border-green-200 mt-1">
                                                    <Gift className="h-4 w-4 mt-0.5 shrink-0" />
                                                    <p className="text-xs font-medium">You'll find this surprise gift tucked inside one of your product boxes!</p>
                                                </div>
                                            )}

                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                {item.size && <span>Size: {item.size}</span>}
                                                {item.color && <span>Color: {item.color}</span>}
                                            </div>
                                            
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <p className="text-base font-bold text-foreground">
                                                    {isGift ? 'FREE' : `₹${item.product.sellingPrice.toLocaleString('en-IN')}`}
                                                </p>
                                                {hasDiscount && !isGift && (
                                                    <>
                                                        <p className="text-sm font-medium text-muted-foreground line-through">₹{item.product.mrp!.toLocaleString('en-IN')}</p>
                                                        <p className="text-sm font-semibold text-green-600">{discountPercentage}% off</p>
                                                    </>
                                                )}
                                            </div>

                                            {!isGift && (
                                                <div className="flex items-center gap-2 text-sm mt-1">
                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                    <span>Delivery by {deliveryDate}</span>
                                                </div>
                                            )}
                                            
                                            <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                                                {!isGift && (
                                                    <>
                                                        <Button variant="ghost" size="sm" className="p-0 h-auto text-destructive" onClick={() => handleRemoveItem(item.product._id as string)}><Trash2 className="mr-1 h-4 w-4"/>Remove</Button>
                                                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => handleMoveToWishlist(item.product._id as string)}><Heart className="mr-1 h-4 w-4"/>Move to Wishlist</Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </CardContent>
                        </Card>
                    </HiddenScrollArea>
                </div>
                <aside className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
                     <div className="sticky top-24 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5"/> Coupons</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Input placeholder="Enter coupon code"/>
                                <Button variant="outline">Apply</Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span className="">Product Savings</span>
                                        <span>- ₹{totalDiscount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                {milestoneDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span className="">Milestone Discount</span>
                                        <span>- ₹{milestoneDiscount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{shipping === 0 ? <span className="font-medium text-green-600">FREE</span> : `₹${shipping.toLocaleString('en-IN')}`}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Grand Total</span>
                                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <Button size="lg" className="w-full h-12 text-base mt-4" onClick={handleCheckout}>
                                    Proceed to Checkout
                                </Button>
                            </CardContent>
                        </Card>
                        <ExploreBrands />
                    </div>
                </aside>
            </div>
        </div>
      </main>
    </>
  );
}
