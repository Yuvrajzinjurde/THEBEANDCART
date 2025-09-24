
"use client";

import { useEffect, useState } from "react";
import withAuth from "@/components/auth/with-auth";
import { useAuth } from "@/hooks/use-auth";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IOrder } from "@/models/order.model";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, AlertCircle } from "lucide-react";
import Header from "@/components/header";
import { GlobalFooter } from "@/components/global-footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function MyOrdersPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            };
            try {
                const response = await fetch('/api/user/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch orders.');
                }
                const data = await response.json();
                setOrders(data.orders);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    return (
        <>
            <Header />
            <main className="container py-8 px-4 sm:px-6 lg:px-8 flex-grow">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Order History</CardTitle>
                        <CardDescription>A list of all your past and current orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader className="h-8 w-8" />
                            </div>
                        ) : error ? (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                                <Package className="h-16 w-16 mb-4" />
                                <p className="font-semibold">No orders found.</p>
                                <p className="text-sm">You haven't placed any orders yet.</p>
                                <Button asChild variant="link" className="mt-2">
                                    <Link href="/">Continue Shopping</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order._id as string}>
                                                <TableCell className="font-mono text-xs">#{(order._id as string).slice(-8).toUpperCase()}</TableCell>
                                                <TableCell>{format(new Date(order.createdAt as string), 'dd MMM, yyyy')}</TableCell>
                                                <TableCell className="capitalize">{order.brand}</TableCell>
                                                <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">View Details</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            <GlobalFooter />
        </>
    );
}

export default withAuth(MyOrdersPage, ['user', 'admin']);
