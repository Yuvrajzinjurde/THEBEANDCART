
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

import type { IUser } from '@/models/user.model';
import type { IOrder } from '@/models/order.model';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getUserDetails, type UserDetails } from './actions';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [details, setDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const userDetails = await getUserDetails(userId);
                setDetails(userDetails);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [userId]);

    const handleDownload = () => {
        if (!details || details.orders.length === 0) {
            toast.warn("No orders to export.");
            return;
        }

        toast.info("Generating report...");

        try {
            const flattenedData = details.orders.map((order: any) => ({
                'Order ID': order._id,
                'Total Amount': order.totalAmount,
                'Status': order.status,
                'Brand': order.brand,
                'Order Date': format(new Date(order.createdAt), 'PPpp'),
                'Product Count': order.products.length,
            }));

            const worksheet = XLSX.utils.json_to_sheet(flattenedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
            
            const fileName = `user_${userId}_orders_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success("Order report downloaded successfully!");
        } catch (err) {
            toast.error("Failed to generate report.");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full flex-1 items-center justify-center">
                <Loader className="h-8 w-8" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-destructive">{error}</div>;
    }

    if (!details) {
        return <div className="text-center text-muted-foreground">User not found.</div>;
    }

    const { user, orders } = details;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-xl font-semibold">User Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                             <Badge 
                                variant={user.status === 'active' ? 'default' : 'destructive'} 
                                className={cn(user.status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300')}
                            >
                                {user.status}
                            </Badge>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Brand</span>
                            <Badge variant="secondary">{user.brand}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined</span>
                            <span>{format(new Date(user.createdAt as string), 'MMM d, yyyy')}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Orders</span>
                            <span>{orders.length}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>A list of all orders placed by this user.</CardDescription>
                        </div>
                        <Button onClick={handleDownload} disabled={orders.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Report
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <TableRow key={order._id as string}>
                                            <TableCell className="font-mono text-xs">{(order._id as string).slice(-8)}</TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {format(new Date(order.createdAt as string), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="secondary">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">₹{order.totalAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No orders found for this user.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
