
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, type User } from '@/hooks/use-auth';
import useUserStore from '@/stores/user-store';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PlusCircle, ArrowLeft, Edit, Gift } from 'lucide-react';
import { toast } from 'sonner';
import type { IProduct } from '@/models/product.model';
import type { ICartItem } from '@/models/cart.model';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import useCartSettingsStore from '@/stores/cart-settings-store';


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

const SHIPPING_COST = 50;
const EXTRA_DISCOUNT_PERCENTAGE = 0.10; // 10%

export default function CheckoutPage() {
    const router = useRouter();
    const { user, token, loading: authLoading, checkUser } = useAuth();
    const { cart, setCart } = useUserStore();
    const { settings: cartSettings } = useCartSettingsStore();
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?redirect=/checkout');
        }
    }, [authLoading, user, router]);
    
    useEffect(() =>
        {
        if (user?.addresses && user.addresses.length > 0) {
            const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setSelectedAddressId(defaultAddress?._id);
        }
    }, [user?.addresses]);


    const { subtotal, totalDiscount, milestoneDiscount, shipping, grandTotal, cartItems } = useMemo(() => {
        const sub = cart?.items?.reduce((acc, item) => {
            const product = item.productId as IProduct;
            if (!product) return acc;
            return acc + product.sellingPrice * item.quantity;
        }, 0) || 0;

        const discount = cart?.items?.reduce((acc, item) => {
            const product = item.productId as IProduct;
            if (!product) return acc;
            const mrp = product.mrp || product.sellingPrice;
            return acc + (mrp - product.sellingPrice) * item.quantity;
        }, 0) || 0;

        const milestoneDisc = (cartSettings.extraDiscountThreshold && sub >= cartSettings.extraDiscountThreshold) ? sub * EXTRA_DISCOUNT_PERCENTAGE : 0;
        const ship = (cartSettings.freeShippingThreshold && sub >= cartSettings.freeShippingThreshold) || sub === 0 ? 0 : SHIPPING_COST;
        const grand = sub - milestoneDisc + ship;
        
        const items = cart?.items
            ?.filter((item): item is ICartItem & { productId: IProduct } => !!item.productId)
            .map((item) => ({ ...item, product: item.productId })) || [];

        return { subtotal: sub, totalDiscount: discount, milestoneDiscount: milestoneDisc, shipping: ship, grandTotal: grand, cartItems: items };
    }, [cart, cartSettings]);
    
    // Determine if the free gift should be included based on cart value
    const isFreeGiftIncluded = useMemo(() => {
        return cartSettings.freeGiftThreshold && subtotal >= cartSettings.freeGiftThreshold;
    }, [subtotal, cartSettings]);


    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address.");
            return;
        }

        setIsPlacingOrder(true);
        toast.info("Placing your order...");
        
        try {
            const itemsToOrder = cartItems.map(item => ({
                productId: (item.product as IProduct)._id as string,
                quantity: item.quantity,
                price: (item.product as IProduct).sellingPrice,
                color: item.color,
                size: item.size
            }));

            const response = await fetch('/api/orders/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: itemsToOrder,
                    subtotal: subtotal,
                    shippingAddressId: selectedAddressId,
                    isFreeGiftAdded: isFreeGiftIncluded,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                 const errorDetails = result.errors ? Object.entries(result.errors).map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`).join('; ') : '';
                 throw new Error(result.message + (errorDetails ? ` ${errorDetails}`: ''));
            }
            
            setCart(null); 
            toast.success("Order placed successfully!");
            router.push(`/dashboard/orders/${result.orderId}`);

        } catch (error: any) {
            console.error("Checkout failed", error);
            toast.error(error.message || 'Could not place order.');
        } finally {
            setIsPlacingOrder(false);
        }
    };


    if (authLoading || !user || !cart) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader className="h-12 w-12"/></div>;
    }

    return (
        <>
            <main className="container flex-1 py-8 px-4">
                 <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="text-2xl font-bold">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4">
                                    {user.addresses?.map((address, index) => (
                                        <Label
                                            key={address._id || index}
                                            htmlFor={address._id || `address-${index}`}
                                            className={cn(
                                                "flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all",
                                                selectedAddressId === address._id && "border-primary ring-2 ring-primary"
                                            )}
                                        >
                                            <RadioGroupItem value={address._id} id={address._id || `address-${index}`} className="mt-1" />
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{address.fullName}</p>
                                                        <p className="text-muted-foreground text-sm">{address.street}, {address.city}, {address.state} - {address.zip}</p>
                                                        <p className="text-muted-foreground text-sm">Mobile: {address.phone}</p>
                                                    </div>
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                        <Link href={`/dashboard/addresses/edit/${address._id}`}><Edit className="h-4 w-4" /></Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <Button variant="outline" className="mt-4 w-full" asChild>
                                    <Link href="/dashboard/addresses/new">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add New Address
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle>Order Items ({cartItems.length + (isFreeGiftIncluded ? 1 : 0)})</CardTitle></CardHeader>
                            <CardContent className="divide-y">
                                {isFreeGiftIncluded && (
                                     <div className="flex items-center gap-4 py-4 first:pt-0">
                                        <div className="w-16 h-16 rounded-md border bg-muted flex items-center justify-center p-2">
                                            <GiftBoxIcon />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">Surprise Gift</p>
                                            <p className="text-sm text-muted-foreground">From us, to you!</p>
                                        </div>
                                        <p className="font-semibold text-green-600">FREE</p>
                                    </div>
                                )}
                                {cartItems.map(item => (
                                    <div key={(item.product as IProduct)._id} className="flex items-center gap-4 py-4 first:pt-0">
                                        <Image src={item.product.images[0]} alt={item.product.name} width={64} height={64} className="rounded-md border object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.product.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">
                                            {(item.product as IProduct).sellingPrice === 0 ? 'FREE' : `₹${(item.product.sellingPrice * item.quantity).toLocaleString()}`}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:sticky top-24 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Price Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                                {totalDiscount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Product Savings</span><span>- ₹{totalDiscount.toLocaleString()}</span></div>}
                                {milestoneDiscount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Milestone Discount</span><span>- ₹{milestoneDiscount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span></div>}
                                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? <span className="font-medium text-green-600">FREE</span> : `₹${shipping.toLocaleString()}`}</span></div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base"><span>Total Payable</span><span>₹{grandTotal.toLocaleString()}</span></div>
                            </CardContent>
                        </Card>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button size="lg" className="w-full h-12 text-base" disabled={isPlacingOrder || !selectedAddressId}>
                                    {isPlacingOrder ? <Loader className="mr-2"/> : null}
                                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm and Place Order?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        By confirming, your order will be placed and you will be redirected to the orders page.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePlaceOrder}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </main>
        </>
    );
}
