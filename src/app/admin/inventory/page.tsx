
"use client";

import { useEffect, useState } from 'react';
import useBrandStore from '@/stores/brand-store';
import { getProductsByBrand } from './actions';
import type { IProduct } from '@/models/product.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
    const { selectedBrand } = useBrandStore();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedProducts = await getProductsByBrand(selectedBrand);
            setProducts(fetchedProducts);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedBrand]);

    const handleSeed = async () => {
        setIsSeeding(true);
        toast.info("Seeding database... This might take a moment.");
        try {
          await fetch('/api/seed', { method: 'POST' });
          toast.success('Database seeded successfully!');
          // Refresh products
          await fetchProducts();
        } catch (error) {
          toast.error('Failed to seed database.');
          console.error(error);
        } finally {
          setIsSeeding(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                        Showing products for: <strong>{selectedBrand}</strong>
                    </CardDescription>
                </div>
                <Button onClick={handleSeed} disabled={isSeeding}>
                    {isSeeding && <Loader className="mr-2 h-4 w-4" />}
                    Seed Products
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
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                                <TableHead className="hidden md:table-cell">Rating</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id as string}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.images[0]}
                                            width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                         <Badge 
                                            variant={product.stock > 0 ? "default" : "destructive"}
                                            className={cn(product.stock > 0 && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300")}
                                        >
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.rating}/5</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
