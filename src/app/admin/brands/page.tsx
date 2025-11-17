
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

import type { IBrand } from '@/models/brand.model';
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

export default function ManageBrandsPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      setBrands(data.brands);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (permanentName: string) => {
    toast.info("Deleting brand...");
    try {
      const response = await fetch(`/api/brands/${permanentName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete brand');
      }

      toast.success('Brand deleted successfully!');
      // Refresh the list of brands
      fetchBrands();
    } catch (err: any) {
      toast.error(err.message);
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Manage Brands</CardTitle>
            <CardDescription>View, edit, or delete your brands.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/admin/brands/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Brand
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
                <TableHead className="hidden w-[80px] sm:table-cell">Logo</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead className="hidden md:table-cell">Permanent Name</TableHead>
                <TableHead className="hidden md:table-cell">Theme</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.permanentName}>
                  <TableCell className="hidden sm:table-cell">
                    <div className="aspect-square rounded-md object-contain relative h-10 w-10">
                        <Image
                        alt={`${brand.displayName} logo`}
                        className="rounded-md"
                        src={brand.logoUrl}
                        fill
                        style={{ objectFit: 'contain' }}
                        />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{brand.displayName}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-sm">{brand.permanentName}</TableCell>
                   <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{brand.themeName}</Badge>
                   </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="icon" className="h-8 w-8">
                        <Link href={`/admin/brands/edit/${brand.permanentName}`}>
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
                              This action will permanently delete the <strong>{brand.displayName}</strong> brand and all associated data. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(brand.permanentName)}>
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
      </CardContent>
    </Card>
  );
}

    
