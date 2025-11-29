"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { IOrder, IOrderProduct } from "@/models/order.model";
import type { IProduct } from "@/models/product.model";

// Define the populated order type here
interface PopulatedOrderProduct extends Omit<IOrderProduct, 'productId'> {
  productId: IProduct;
}

interface PopulatedOrder extends Omit<IOrder, 'products'> {
  products: PopulatedOrderProduct[];
}


const OrderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-48 rounded bg-muted"></div>
                        <div className="h-4 w-32 rounded bg-muted"></div>
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-4 w-full rounded bg-muted"></div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <div className="h-10 w-32 rounded-md bg-muted"></div>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function OrdersPage() {
    const { user, token, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<PopulatedOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !token) {
                setLoading(false);
                return;
            };
            try {
                const response = await fetch('/api/orders/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch orders.");
                }
                const data = await response.json();
                setOrders(data.orders);
            } catch (error: any) {
                toast.error(error.message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        
        if (!authLoading) {
            fetchOrders();
        }

    }, [user, token, authLoading]);

  if (loading || authLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package /> My Orders</CardTitle>
                  <CardDescription>View your past and current orders.</CardDescription>
              </CardHeader>
              <CardContent>
                  <OrderSkeleton />
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Package /> My Orders</CardTitle>
        <CardDescription>View your past and current orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id as string} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="grid gap-1 text-sm">
                            <p className="font-semibold text-foreground">Order ID: #{order.brand.toUpperCase()}{(order._id as string).slice(-6)}</p>
                            <p className="text-muted-foreground">Date: {format(new Date(order.createdAt), 'dd MMM, yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <p className="text-sm font-semibold">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                           <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent className="p-4 space-y-4">
                    {order.products.map(({ productId: product, quantity }) => (
                         <div key={product._id as string} className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-md overflow-hidden border relative flex-shrink-0">
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                             </div>
                             <div className="flex-grow">
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                             </div>
                              <p className="text-sm font-medium">₹{(product.sellingPrice * quantity).toLocaleString('en-IN')}</p>
                         </div>
                    ))}
                </CardContent>
                 <CardFooter className="bg-muted/50 p-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="#">View Details <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold">No Orders Yet</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Looks like you haven't placed any orders. Start shopping to see your history here!
                </p>
                <Button asChild className="mt-6">
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
