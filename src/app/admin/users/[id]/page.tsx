

"use client";

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, FileSpreadsheet, User as UserIcon, Mail, Phone, ShoppingCart, XCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from "xlsx";

import type { UserDetails } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { getUserDetails } from './actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const UserDetailsSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex flex-col space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 text-center mt-2 divide-x">
                        {[...Array(3)].map((_, i) => (
                             <div key={i} className="flex flex-col items-center space-y-1">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-6 w-8" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="grid gap-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <Skeleton className="h-10 w-64" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                </div>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(6)].map((_, j) => (
                                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        <p className="mt-8 text-lg text-muted-foreground text-center">Just a moment, getting everything ready for you…</p>
    </div>
);


export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [details, setDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!userId) return;

        const fetchDetails = async () => {
          startTransition(async () => {
            setError(null);
            try {
                const userDetails = await getUserDetails(userId);
                setDetails(userDetails);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
          });
        };

        fetchDetails();
    }, [userId]);
    
    const handleDownload = () => {
        if (!details || !details.orders || details.orders.length === 0) {
            toast.warning("No orders to export for this user.");
            return;
        }

        toast.info("Generating order report...");

        const flattenedData = filteredOrders.map((order: any) => ({
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
        
        const fileName = `user_${userId}_orders.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success("Report downloaded successfully!");
    };


    if (loading) {
        return <UserDetailsSkeleton />;
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
                     <h1 className="text-xl font-bold">User Details</h1>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-purple-100 text-purple-800 md:col-span-1">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                         <Avatar className="h-14 w-14 text-2xl border-2 border-purple-200">
                            {user.profilePicUrl && <AvatarImage src={user.profilePicUrl} alt={user.firstName} />}
                            <AvatarFallback className="bg-purple-200">{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                            <CardDescription className="text-purple-600">{user.email}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 text-center mt-2 divide-x divide-purple-200">
                           <div className="flex flex-col items-center">
                                <ShoppingCart className="h-5 w-5 mb-1"/>
                                <p className="text-xs">Total Orders</p>
                                <p className="text-lg font-bold">{stats.totalOrders}</p>
                            </div>
                           <div className="flex flex-col items-center">
                                <XCircle className="h-5 w-5 mb-1"/>
                                <p className="text-xs">Cancelled</p>
                                <p className="text-lg font-bold">{stats.cancelledOrders}</p>
                            </div>
                           <div className="flex flex-col items-center">
                                <p className="text-2xl font-bold">₹</p>
                                <p className="text-xs">Total Spend</p>
                                <p className="text-lg font-bold">{stats.totalSpend.toFixed(0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-100 text-blue-800 md:col-span-2">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-4">
                            <UserIcon className="h-6 w-6"/>
                            <CardTitle>User Info</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                         <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                            <div><span className="font-semibold">Email:</span> {user.email}</div>
                         </div>
                          <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                            <div><span className="font-semibold">Phone:</span> {user.phone || 'N/A'}</div>
                         </div>
                         <div className="flex items-start gap-3 sm:col-span-2">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold">Default Address:</span>
                                {user.addresses && user.addresses.length > 0 ? (
                                    <span> {user.addresses[0].street}, {user.addresses[0].city}, {user.addresses[0].state} - {user.addresses[0].zip}</span>
                                ) : (
                                    ' N/A'
                                )}
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <p className="text-xs font-mono bg-blue-200/80 rounded px-2 py-1">
                                Joined on {format(new Date(user.createdAt as string), 'dd MMM, yyyy')}
                            </p>
                         </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search by Order ID" 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                             <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
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
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleDownload}
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700"
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Download Report
                            </Button>
                        </div>
                    </div>
                    {isPending ? (
                      <UserDetailsSkeleton />
                    ) : (
                      <div className="overflow-x-auto border rounded-md">
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
