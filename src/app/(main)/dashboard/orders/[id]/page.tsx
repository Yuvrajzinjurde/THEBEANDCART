
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import type { IOrder, IOrderProduct } from '@/models/order.model';
import type { IProduct } from '@/models/product.model';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
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

interface PopulatedOrderProduct extends Omit<IOrderProduct, 'productId'> {
  productId: IProduct;
}

interface PopulatedOrder extends Omit<IOrder, 'products'> {
  products: PopulatedOrderProduct[];
}

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
    const { token, loading: authLoading } = useAuth();
    const orderId = params.id as string;

    const [order, setOrder] = useState<PopulatedOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId || !token) return;

        const fetchOrderDetails = async () => {
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
        };

        if (!authLoading) {
            fetchOrderDetails();
        }
    }, [orderId, token, authLoading, router]);

    if (loading) {
        return <OrderDetailsSkeleton />;
    }

    if (!order) {
        return <div>Order not found.</div>;
    }

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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle>Order #{order.orderId}</CardTitle>
                            <CardDescription>Placed on {format(new Date(order.createdAt), 'PPP')}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Package /> Items in this order ({order.products.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {order.products.map(({ productId, quantity, price }) => (
                                    <div key={productId._id} className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                                            <Image src={productId.images[0]} alt={productId.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{productId.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium">₹{(price * quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Shipping Address</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                            <p>{order.shippingAddress.country}</p>
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
        </div>
    );
}
