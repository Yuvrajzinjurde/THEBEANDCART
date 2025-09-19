
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Edit, Trash2, PlusCircle, Box as BoxIcon } from 'lucide-react';

import type { IBox } from '@/models/box.model';
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

export default function ManageBoxesPage() {
  const { selectedBrand } = useBrandStore();
  const [boxes, setBoxes] = useState<IBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boxes?storefront=${selectedBrand}`);
      if (!response.ok) {
        throw new Error('Failed to fetch boxes');
      }
      const data = await response.json();
      setBoxes(data.boxes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, [selectedBrand]);

  const handleDelete = async (boxId: string) => {
    toast.info("Deleting box...");
    try {
      const response = await fetch(`/api/boxes/${boxId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete box');
      }

      toast.success('Box deleted successfully!');
      fetchBoxes(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message);
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2"><BoxIcon /> Boxes & Bags</CardTitle>
            <CardDescription>Manage packaging options for <strong>{selectedBrand}</strong>.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/admin/boxes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Box/Bag
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
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boxes.map((box) => (
                <TableRow key={box._id as string}>
                  <TableCell>
                    <Image
                      alt={box.name}
                      className="aspect-square rounded-md object-contain"
                      height="64"
                      src={box.images[0]}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{box.name}</TableCell>
                  <TableCell>₹{box.price.toFixed(2)}</TableCell>
                  <TableCell>{box.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
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
                              This action will permanently delete the <strong>{box.name}</strong>. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(box._id as string)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {boxes.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No boxes or bags found for this brand.</p>
             <Button asChild variant="link" className="mt-2">
                <Link href="/admin/boxes/new">Create your first one</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
