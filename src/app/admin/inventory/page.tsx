

"use client";

import { useEffect, useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info, FileSpreadsheet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryPage() {
    const { selectedBrand } = useBrandStore();
    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    
    const [activeTab, setActiveTab] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortOption, setSortOption] = useState('estimated-orders-desc');

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedProducts = await getProductsByBrand(selectedBrand);
            setAllProducts(fetchedProducts);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedBrand]);

    const { stockCounts, uniqueCategories } = useMemo(() => {
        const outOfStock = allProducts.filter(p => p.stock === 0).length;
        const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
        const categories = new Set(allProducts.map(p => p.category));
        return {
            stockCounts: {
                all: allProducts.length,
                outOfStock,
                lowStock,
            },
            uniqueCategories: ['all', ...Array.from(categories)],
        };
    }, [allProducts]);

    useEffect(() => {
        let productsToDisplay = allProducts;

        // Tab filter
        if (activeTab === 'out-of-stock') {
            productsToDisplay = productsToDisplay.filter(p => p.stock === 0);
        } else if (activeTab === 'low-stock') {
            productsToDisplay = productsToDisplay.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            productsToDisplay = productsToDisplay.filter(p => p.category === categoryFilter);
        }

        // Sorting (placeholder for now)
        if (sortOption === 'estimated-orders-desc') {
            // This is a placeholder. Real sorting would need order data.
            // For now, we can sort by stock as a proxy.
            productsToDisplay.sort((a, b) => b.stock - a.stock);
        }
        
        setFilteredProducts(productsToDisplay);
    }, [activeTab, categoryFilter, sortOption, allProducts]);

    const handleSeed = async () => {
        setIsSeeding(true);
        toast.info("Seeding database... This might take a moment.");
        try {
          await fetch('/api/seed', { method: 'POST' });
          toast.success('Database seeded successfully!');
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
            <CardHeader className="flex flex-row items-start justify-between">
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
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex items-center justify-between border-b">
                            <TabsList className="bg-transparent p-0 border-none">
                                <TabsTrigger value="all" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 border-b-primary rounded-none">All Stock ({stockCounts.all})</TabsTrigger>
                                <TabsTrigger value="out-of-stock" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 border-b-primary rounded-none">Out of Stock ({stockCounts.outOfStock})</TabsTrigger>
                                <TabsTrigger value="low-stock" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 border-b-primary rounded-none">
                                    <div className="flex items-center gap-2">
                                        <span>Low Stock ({stockCounts.lowStock})</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Products with less than or equal to {LOW_STOCK_THRESHOLD} items in stock.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                             <Button variant="link" className="text-primary">
                                <FileSpreadsheet className="mr-2 h-4 w-4"/>
                                Bulk Stock Update
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 py-4 px-1">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueCategories.map(category => (
                                            <SelectItem key={category} value={category} className="capitalize">{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Sort catalogs by:</span>
                                 <Select value={sortOption} onValueChange={setSortOption}>
                                    <SelectTrigger className="w-[220px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="estimated-orders-desc">Highest Estimated Orders</SelectItem>
                                        <SelectItem value="stock-asc">Lowest Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <TabsContent value={activeTab} className="mt-0">
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
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
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
                                                        className={cn(
                                                            product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
                                                            product.stock > LOW_STOCK_THRESHOLD && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                                        )}
                                                    >
                                                        {product.stock === 0 ? 'Out of Stock' : product.stock <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                                <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                                <TableCell className="hidden md:table-cell">{product.rating}/5</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No products to display in this category.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}

