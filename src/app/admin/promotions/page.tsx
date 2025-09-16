
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Edit, Trash2, PlusCircle, TicketPercent } from 'lucide-react';
import { format } from 'date-fns';

import type { ICoupon } from '@/models/coupon.model';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import useBrandStore from '@/stores/brand-store';
import { cn } from '@/lib/utils';

export default function ManageCouponsPage() {
  const { selectedBrand } = useBrandStore();
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/coupons?brand=${selectedBrand}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      const data = await response.json();
      setCoupons(data.coupons);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [selectedBrand]);

  const handleDelete = async (couponId: string) => {
    toast.info("Deleting coupon...");
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete coupon');
      }

      toast.success('Coupon deleted successfully!');
      fetchCoupons(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message);
      console.error(err);
    }
  };

  const getStatus = (coupon: ICoupon) => {
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return { text: 'Expired', className: 'bg-red-100 text-red-800' };
    }
    if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
      return { text: 'Upcoming', className: 'bg-blue-100 text-blue-800' };
    }
    return { text: 'Active', className: 'bg-green-100 text-green-800' };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2">
                <TicketPercent />
                Promotions
            </CardTitle>
            <CardDescription>Manage discount codes and promotions for <strong>{selectedBrand}</strong>.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/admin/promotions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Coupon
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min. Purchase</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = getStatus(coupon);
                return (
                    <TableRow key={coupon._id as string}>
                        <TableCell className="font-mono text-sm">{coupon.code}</TableCell>
                        <TableCell className="capitalize">{coupon.type}</TableCell>
                        <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</TableCell>
                        <TableCell>₹{coupon.minPurchase}</TableCell>
                        <TableCell>{coupon.endDate ? format(new Date(coupon.endDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className={cn(status.className)}>{status.text}</Badge>
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="icon" className="h-8 w-8">
                            <Link href={`/admin/promotions/edit/${coupon._id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the <strong>{coupon.code}</strong> coupon. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(coupon._id as string)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                );
            })}
            </TableBody>
          </Table>
        )}
         {coupons.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No coupons found for this brand.</p>
             <Button asChild variant="link" className="mt-2">
                <Link href="/admin/promotions/new">Create your first coupon</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

