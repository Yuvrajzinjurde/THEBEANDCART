
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import type { UserDetails } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { getUserDetails } from './actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [details, setDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    const { user, orders, stats } = details;

    const userInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order._id as string).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                     <h1 className="text-xl font-semibold">User Details</h1>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 text-2xl">
                                <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="text-lg font-bold">{user.firstName} {user.lastName}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 text-center mt-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total spend</p>
                                <p className="text-lg font-bold">₹{stats.totalSpend.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total orders</p>
                                <p className="text-lg font-bold">{stats.totalOrders}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cancelled orders</p>
                                <p className="text-lg font-bold">{stats.cancelledOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
                         <div className="text-muted-foreground">Registered On</div>
                         <div>{format(new Date(user.createdAt as string), 'dd/MM/yyyy')}</div>
                         
                         <div className="text-muted-foreground">Email</div>
                         <div className="truncate">{user.email}</div>

                         <div className="text-muted-foreground">Phone</div>
                         <div>{user.phone || 'N/A'}</div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
                    <CardContent className="pt-2">
                        {user.address && user.address.street ? (
                             <address className="text-sm not-italic text-muted-foreground">
                                {user.address.street}, {user.address.city}<br/>
                                {user.address.state} - {user.address.zip}<br/>
                                {user.address.country}
                            </address>
                        ): (
                            <p className="text-sm text-muted-foreground">No delivery address added</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search by Order ID" 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Cart</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order._id as string}>
                                            <TableCell className="font-mono text-xs">#{(order._id as string).slice(-8).toUpperCase()}</TableCell>
                                            <TableCell>{format(new Date(order.createdAt as string), 'dd MMM yyyy, hh:mm a')}</TableCell>
                                            <TableCell>{order.products.length} items</TableCell>
                                            <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No Orders Available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
