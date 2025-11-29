
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import type { IOrder, IOrderProduct } from '@/models/order.model';
import type { IProduct } from '@/models/product.model';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Package, MapPin, Truck, Star, Edit, XCircle, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import usePlatformSettingsStore from '@/stores/platform-settings-store';
import { AddressSelectionDialog } from '@/components/address-selection-dialog';

interface PopulatedOrderProduct extends Omit<IOrderProduct, 'productId'> {
  productId: IProduct | null;
}

type PopulatedShippingAddress = {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    addressType: string;
};

interface PopulatedOrder extends Omit<IOrder, 'products' | 'shippingAddress'> {
  products: PopulatedOrderProduct[];
  shippingAddress: PopulatedShippingAddress;
  isFreeGiftAdded?: boolean;
}

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

const OrderDetailsSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-muted rounded-md"></div>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card><CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader><CardContent><div className="h-24 bg-muted rounded"></div></CardContent></Card>
            </div>
            <div className="space-y-6">
                <Card><CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader><CardContent><div className="h-24 bg-muted rounded"></div></CardContent></Card>
                <Card><CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader><CardContent><div className="h-24 bg-muted rounded"></div></CardContent></Card>
            </div>
        </div>
    </div>
);


export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token, loading: authLoading, checkUser } = useAuth();
    const orderId = params.id as string;
    const { settings, fetchSettings } = usePlatformSettingsStore();

    const [order, setOrder] = useState<PopulatedOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId || !token) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch order details.");
            }
            const { order } = await response.json();
            setOrder(order);
        } catch (error: any) {
            toast.error(error.message);
            router.push('/dashboard/orders');
        } finally {
            setLoading(false);
        }
    }, [orderId, token, router]);

    useEffect(() => {
        fetchSettings();
        if (!authLoading) {
            fetchOrderDetails();
        }
    }, [orderId, token, authLoading, router, fetchSettings, fetchOrderDetails]);

    const isCancellable = useMemo(() => {
        if (!order || !settings) return false;
        if (['cancelled', 'delivered', 'shipped'].includes(order.status)) return false;

        const cancellableUntilStatus = settings.cancellableOrderStatus || 'pending';
        if (cancellableUntilStatus === 'ready-to-ship') {
            return ['pending', 'on-hold', 'ready-to-ship'].includes(order.status);
        }
        return ['pending', 'on-hold'].includes(order.status);
    }, [order, settings]);
    
    const isAddressEditable = useMemo(() => {
        if (!order) return false;
        return !['shipped', 'delivered', 'cancelled'].includes(order.status);
    }, [order]);
    
     const handleCancelOrder = async () => {
        if (!order) return;
        setIsCancelling(true);
        toast.info("Cancelling your order...");
        try {
            const response = await fetch(`/api/orders/${order._id}/cancel`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            toast.success("Order cancelled successfully.");
            setOrder(result.order);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCancelling(false);
        }
    };
    
    const handleAddressSaveSuccess = async () => {
        toast.success("Shipping address updated successfully!");
        setIsAddressModalOpen(false);
        await checkUser(); // Re-fetch user data to get updated addresses
        await fetchOrderDetails(); // Re-fetch order details to show the new address
    };


    if (loading || authLoading) {
        return <OrderDetailsSkeleton />;
    }

    if (!order) {
        return <div>Order not found.</div>;
    }
    
    const deliveryDate = format(new Date(order.updatedAt), 'MMM dd');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                 <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/dashboard/orders">My Orders</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Order #{order.orderId}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            
             <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                            <CardTitle>Order #{order.orderId}</CardTitle>
                            <CardDescription>Placed on {format(new Date(order.createdAt), 'PPP')}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className="text-lg font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                             {isCancellable && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={isCancelling}>
                                            {isCancelling ? <Loader className="mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                                            Cancel Order
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This action will cancel your order. This cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleCancelOrder}>Confirm Cancellation</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Package /> Items in this order ({order.products.length + (order.isFreeGiftAdded ? 1 : 0)})</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {order.isFreeGiftAdded && (
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 py-4 first:pt-0">
                                    <div className="md:col-span-3 flex items-start gap-4">
                                         <div className="relative w-20 h-20 rounded-md overflow-hidden border flex-shrink-0 bg-primary/10 p-2 flex items-center justify-center">
                                            <GiftBoxIcon />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-muted-foreground">From us, to you!</p>
                                            <p className="text-lg font-bold">Surprise Gift</p>
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 text-green-700 border border-green-200 mt-2">
                                                <Gift className="h-4 w-4 shrink-0" />
                                                <p className="text-xs font-medium">You'll find this surprise gift tucked inside one of your product boxes!</p>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="md:col-span-1 text-left md:text-right">
                                        <p className="font-semibold text-green-600">FREE</p>
                                    </div>
                                </div>
                            )}
                            {order.products.map((item) => {
                                const { productId: product, quantity, price } = item;
                                if (!product) return null;

                                return (
                                <div key={product._id as string} className="grid grid-cols-1 md:grid-cols-6 gap-4 py-4 first:pt-0">
                                    <Link href={`/${product.storefront}/products/${product._id}`} className="md:col-span-3 flex items-start gap-4 group">
                                        <div className="relative w-20 h-20 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
                                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-semibold group-hover:text-primary transition-colors">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                                            {item.color && <p className="text-sm text-muted-foreground">Color: {item.color}</p>}
                                            {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                                        </div>
                                    </Link>
                                    <div className="md:col-span-1 text-left md:text-right">
                                        <p className="font-semibold">₹{(price * quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="md:col-span-2 text-left">
                                        {order.status === 'delivered' ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                                    <p className="font-semibold">Delivered on {deliveryDate}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground ml-4">Your item has been delivered</p>
                                                <Button variant="link" asChild className="p-0 h-auto ml-4 mt-1 text-primary">
                                                    <Link href={`/${product.storefront}/products/${product._id}#reviews`}><Star className="mr-1 h-4 w-4" />Rate & Review Product</Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                                                 <p className="font-semibold capitalize">{order.status}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><MapPin /> Shipping Address</CardTitle>
                            {isAddressEditable && (
                                <Button variant="outline" size="sm" onClick={() => setIsAddressModalOpen(true)}><Edit className="mr-2 h-4 w-4" />Change</Button>
                            )}
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                <Badge variant="outline" className="capitalize">{order.shippingAddress.addressType}</Badge>
                            </div>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                            <p>{order.shippingAddress.country}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Truck /> Delivery Status</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            <p className="capitalize">{order.status}</p>
                             <p className="text-muted-foreground">Estimated delivery by {format(new Date(), 'PPP')}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
             {user && (
                <AddressSelectionDialog
                    isOpen={isAddressModalOpen} 
                    setIsOpen={setIsAddressModalOpen} 
                    orderId={order._id as string}
                    onSaveSuccess={handleAddressSaveSuccess}
                />
            )}
        </div>
    );
}
