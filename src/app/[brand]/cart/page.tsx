
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Store,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
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
import type { ICartItem } from "@/models/cart.model";
import type { IBrand } from "@/models/brand.model";
import { addDays, format } from 'date-fns';
import { CartProgressBar } from "@/components/cart-progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const SHIPPING_COST = 50;
const FREE_SHIPPING_THRESHOLD = 399;
const EXTRA_DISCOUNT_THRESHOLD = 799;
const FREE_GIFT_THRESHOLD = 999;
const EXTRA_DISCOUNT_PERCENTAGE = 0.10; // 10%

// Create a mock product for the free gift
const freeGiftProduct: IProduct = {
    _id: 'free-gift-id',
    name: 'Surprise Gift',
    brand: 'From us, to you!',
    images: [''], // No image needed, we use the icon
    sellingPrice: 0,
    mrp: 999, // Show a perceived value
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

const CartFooter = ({ brand }: { brand: IBrand | null }) => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container py-6 px-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                    {brand?.logoUrl && (
                        <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={32} height={32} className="h-8 w-8 object-cover rounded-full" />
                    )}
                    <span className="text-lg font-bold capitalize">{brand?.displayName}</span>
                </div>
                 <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                    <Link href={`/${brand?.permanentName}/legal/about-us`} className="hover:text-primary">About Us</Link>
                    <Link href={`/${brand?.permanentName}/legal/privacy-policy`} className="hover:text-primary">Policies</Link>
                    <Link href={`/${brand?.permanentName}/legal/contact-us`} className="hover:text-primary">Contact Us</Link>
                </div>
                 <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
             <div className="mt-4 border-t pt-4">
                <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {brand?.displayName}. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

const CartSkeleton = () => (
    <>
     <div className="sticky top-16 z-20 w-full bg-background/95 py-2 backdrop-blur-sm border-b">
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
    <main className="container pt-6 px-10 text-center">
        <div className="mx-auto text-center">
          <p className="my-8 text-lg text-muted-foreground col-span-full">Just a moment, getting everything ready for you…</p>
        </div>
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


export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const brandName = params.brand as string || 'reeva';
  const { user, token, loading: authLoading } = useAuth();
  const { cart, setCart, setWishlist } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [allBrands, setAllBrands] = useState<IBrand[]>([]);
  const [brand, setBrand] = useState<IBrand | null>(null);

  useEffect(() => {
    async function fetchBrandsAndBrand() {
        try {
            const [brandsResponse, brandResponse] = await Promise.all([
                fetch('/api/brands'),
                fetch(`/api/brands/${brandName}`)
            ]);

            if (brandsResponse.ok) {
                const data = await brandsResponse.json();
                setAllBrands(data.brands);
            }
            if (brandResponse.ok) {
                const data = await brandResponse.json();
                setBrand(data.brand);
            }
        } catch (error) {
            console.error("Failed to fetch brands data", error);
        }
    }
    fetchBrandsAndBrand();
  }, [brandName]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace(`/${brandName}/login`);
        return;
      }
      setLoading(false);
    }
  }, [user, authLoading, router, brandName]);
  
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
        // Add the free gift as an item to the cart list
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
      toast.error("Something went wrong. We apologize for the inconvenience, please try again later.");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCart(result.cart);
    } catch (error: any) {
      toast.error("Something went wrong. We apologize for the inconvenience, please try again later.");
    }
  };

  const handleMoveToWishlist = async (productId: string) => {
    try {
      // First, add to wishlist
      const wishlistRes = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId }),
      });
      const wishlistResult = await wishlistRes.json();
      if (!wishlistRes.ok) throw new Error(wishlistResult.message);
      setWishlist(wishlistResult.wishlist);

      // Then, remove from cart
      await handleRemoveItem(productId);

    } catch (error: any) {
      toast.error("Something went wrong. We apologize for the inconvenience, please try again later.");
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

  const otherBrands = useMemo(() => 
    allBrands.filter(b => b.permanentName !== brandName).slice(0, 2),
    [allBrands, brandName]
  );

  if (loading || authLoading) {
    return <CartSkeleton />;
  }
  
  if (cartItems.length === 0) {
      return (
        <>
        <main className="container py-8 px-10">
            <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-lg">
                <ShoppingCart className="w-20 h-20 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Add items you want to buy to your cart.
                </p>
                <Button asChild className="mt-6">
                    <Link href={`/${brandName}/home`}>Continue Shopping</Link>
                </Button>
            </div>
        </main>
        <CartFooter brand={brand} />
        </>
      );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-16 z-20 w-full bg-background/95 py-2 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between gap-4 px-5">
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
                    <BreadcrumbLink href={`/${brandName}/home`}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex-grow flex justify-center">
                <CartProgressBar currentValue={subtotal} />
            </div>
            <div className="w-48 hidden lg:block" />
        </div>
      </div>

      <main className="container px-10 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 grid lg:grid-cols-12 lg:gap-8 overflow-hidden">
            <div className="lg:col-span-7 xl:col-span-8 overflow-y-auto">
                <Card className="border-none shadow-none">
                    <CardHeader>
                        <CardTitle>My Cart ({cartItems.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                            {cartItems.map(item => {
                                const isGift = item.product._id === 'free-gift-id';
                                const hasDiscount = item.product.mrp && item.product.mrp > item.product.sellingPrice;
                                const discountPercentage = hasDiscount ? Math.round(((item.product.mrp! - item.product.sellingPrice) / item.product.mrp!) * 100) : 0;
                                return (
                                <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row gap-4 py-6 first:pt-0">
                                    <div className="block flex-shrink-0 w-full sm:w-[120px] aspect-square sm:h-[120px]">
                                        {isGift ? (
                                            <div className="w-full h-full p-4 bg-muted/30 rounded-lg flex items-center justify-center">
                                                <GiftBoxIcon />
                                            </div>
                                        ) : (
                                            <Link href={`/products/${item.product._id}?storefront=${item.product.storefront}`} className="block h-full w-full">
                                                <Image src={item.product.images[0]} alt={item.product.name} width={120} height={120} className="rounded-lg object-cover border h-full w-full"/>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-grow gap-1">
                                        <p className="text-sm text-muted-foreground font-medium">{item.product.brand}</p>
                                        <Link href={isGift ? '#' : `/products/${item.product._id}?storefront=${item.product.storefront}`} className={`font-semibold text-base sm:text-lg hover:underline leading-tight ${isGift ? 'pointer-events-none' : ''}`}>{item.product.name}</Link>
                                        
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
                                        
                                        {!isGift ? (
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-4">
                                                <div className="flex items-center gap-1 rounded-full border p-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleQuantityChange(item.product._id as string, item.quantity - 1, item.size, item.color)}><Minus className="h-4 w-4" /></Button>
                                                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleQuantityChange(item.product._id as string, item.quantity + 1, item.size, item.color)}><Plus className="h-4 w-4" /></Button>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button variant="link" className="p-0 h-auto text-sm text-destructive" onClick={() => handleRemoveItem(item.product._id as string)}><Trash2 className="mr-1 h-4 w-4"/>Remove</Button>
                                                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => handleMoveToWishlist(item.product._id as string)}><Heart className="mr-1 h-4 w-4"/>Move to Wishlist</Button>
                                                </div>
                                            </div>
                                        ) : <div className="mt-2 h-8" />}
                                    </div>
                                </div>
                            )})}
                    </CardContent>
                </Card>
            </div>
            <aside className="lg:col-span-5 xl:col-span-4 overflow-y-auto py-6">
                <div className="space-y-6">
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
                            <Button size="lg" className="w-full h-12 text-base mt-4">
                                Proceed to Checkout
                            </Button>
                        </CardContent>
                    </Card>
                    {otherBrands.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><Store className="h-5 w-5"/> Explore Other Brands</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-around items-start gap-4">
                                {otherBrands.map(brand => (
                                    <Link key={brand.permanentName} href={`/${brand.permanentName}/home`} className="flex flex-col items-center gap-2 group">
                                        <div className="relative w-20 h-20 rounded-full border-2 border-transparent group-hover:border-primary transition-all duration-300">
                                            <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} fill className="rounded-full object-cover"/>
                                        </div>
                                        <p className="text-sm font-semibold capitalize">{brand.displayName}</p>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </aside>
        </div>
      </main>
    </div>
  );
}
