
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
import { addDays, format } from 'date-fns';
import { CartProgressBar } from "@/components/cart-progress-bar";

const SHIPPING_COST = 50;
const FREE_SHIPPING_THRESHOLD = 500;

export default function CartPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { cart, setCart, setWishlist } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/"); // Redirect if not logged in
        return;
      }
      setLoading(false);
    }
  }, [user, authLoading, router]);

  const cartItems = useMemo(() => {
    return (
      cart?.items
        ?.map((item) => ({
          ...item,
          product: item.productId as IProduct,
        }))
        .filter((item) => item.product) || []
    );
  }, [cart]);

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
      toast.error(error.message || "Failed to update quantity.");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    toast.info("Removing item...");
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCart(result.cart);
      toast.success("Item removed from cart.");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item.");
    }
  };

  const handleMoveToWishlist = async (productId: string) => {
    toast.info("Moving to wishlist...");
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
      toast.success("Moved to wishlist!");

    } catch (error: any) {
      toast.error(error.message || "Failed to move item.");
    }
  };


  const subtotal = useMemo(() =>
    cartItems.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0),
    [cartItems]
  );
  
  const totalDiscount = useMemo(() =>
    cartItems.reduce((acc, item) => {
      const mrp = item.product.mrp || item.product.sellingPrice;
      return acc + (mrp - item.product.sellingPrice) * item.quantity;
    }, 0),
    [cartItems]
  );
  
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const grandTotal = subtotal + shipping;
  
  const deliveryDate = format(addDays(new Date(), 5), 'EEE, MMM d');


  if (loading || authLoading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader className="h-12 w-12" />
      </main>
    );
  }
  
  if (cartItems.length === 0) {
      return (
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-lg">
                <ShoppingCart className="w-20 h-20 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Add items you want to buy to your cart.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
        </main>
      );
  }

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <CartProgressBar currentValue={subtotal} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Cart ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {cartItems.map(item => {
                             const hasDiscount = item.product.mrp && item.product.mrp > item.product.sellingPrice;
                             const discountPercentage = hasDiscount ? Math.round(((item.product.mrp! - item.product.sellingPrice) / item.product.mrp!) * 100) : 0;
                            return (
                            <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex gap-4">
                                <Link href={`/products/${item.product._id}?storefront=${item.product.storefront}`} className="block flex-shrink-0">
                                    <Image src={item.product.images[0]} alt={item.product.name} width={120} height={120} className="rounded-lg object-cover border"/>
                                </Link>
                                <div className="flex flex-col flex-grow gap-1">
                                    <p className="text-sm text-muted-foreground font-medium">{item.product.brand}</p>
                                    <Link href={`/products/${item.product._id}?storefront=${item.product.storefront}`} className="font-semibold text-lg hover:underline leading-tight">{item.product.name}</Link>
                                    
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.color && <span>Color: {item.color}</span>}
                                    </div>
                                    
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-base font-bold text-foreground">₹{item.product.sellingPrice.toLocaleString('en-IN')}</p>
                                        {hasDiscount && (
                                            <>
                                                <p className="text-sm font-medium text-muted-foreground line-through">₹{item.product.mrp!.toLocaleString('en-IN')}</p>
                                                <p className="text-sm font-semibold text-green-600">{discountPercentage}% off</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm mt-1">
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                        <span>Delivery by {deliveryDate}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
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
                                </div>
                            </div>
                        )})}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
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
                                <span className="">You Saved</span>
                                <span>- ₹{totalDiscount.toLocaleString('en-IN')}</span>
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
             </div>
        </div>
      </div>
    </main>
  );
}
