

"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
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
import { Info, Download, Upload, PlusCircle, ImageIcon, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


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
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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
        const categories = new Set(allProducts.map(p => Array.isArray(p.category) ? p.category[0] : p.category));
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
        let productsToDisplay = [...allProducts];

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

        // Sorting
        if (sortOption === 'stock-asc') {
            productsToDisplay.sort((a, b) => a.stock - b.stock);
        } else if (sortOption === 'estimated-orders-desc') {
            // Placeholder: sort by highest stock as a proxy
            productsToDisplay.sort((a, b) => b.stock - a.stock);
        }
        
        setFilteredProducts(productsToDisplay);
    }, [activeTab, categoryFilter, sortOption, allProducts]);

    const handleSeedData = async () => {
        setIsSeeding(true);
        toast.info("Seeding database... This might take a moment.");
        try {
          const response = await fetch('/api/seed', { method: 'POST' });
          const result = await response.json();
          if (response.ok) {
            toast.success(result.message);
            await fetchProducts(); // Re-fetch products after seeding
          } else {
            toast.error(result.message || 'An unknown error occurred during seeding.');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to seed data.');
          console.error(error);
        } finally {
          setIsSeeding(false);
        }
    };

    const handleDownloadTemplate = () => {
        const data = filteredProducts.map(p => ({
            productId: p._id,
            productName: p.name,
            currentStock: p.stock,
            newStock: '' // Leave empty for user to fill
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Update');
        XLSX.writeFile(workbook, 'stock_update_template.xlsx');
        toast.success("Template downloaded!");
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUpdating(true);
        toast.info("Processing file...");
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<{ productId: string, newStock: number }>(worksheet);

                const updates = json
                    .filter(row => row.productId && typeof row.newStock === 'number' && row.newStock >= 0)
                    .map(row => ({
                        productId: row.productId,
                        stock: row.newStock,
                    }));
                
                if (updates.length === 0) {
                    throw new Error("No valid data to update. Check your file format.");
                }

                const response = await fetch('/api/products/bulk-update-stock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates }),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Failed to update stock.");
                }

                toast.success(`${result.updatedCount} products updated successfully!`);
                fetchProducts(); // Refresh the product list
            } catch (error: any) {
                toast.error(error.message);
                console.error(error);
            } finally {
                setIsUpdating(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset file input
                }
            }
        };

        reader.readAsArrayBuffer(file);
    };
    
    const handleRowClick = (productId: string) => {
        router.push(`/admin/inventory/edit/${productId}`);
    };


    const renderTable = (products: IProduct[]) => (
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
                {products.length > 0 ? (
                    products.map((product) => (
                        <TableRow 
                            key={product._id as string} 
                            onClick={() => handleRowClick(product._id as string)}
                            className="cursor-pointer"
                        >
                            <TableCell className="hidden sm:table-cell">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={product.images[0]}
                                        width="64"
                                    />
                                ) : (
                                    <div className="flex aspect-square h-full w-full items-center justify-center rounded-md bg-muted">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
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
                            <TableCell>
                                {typeof product.sellingPrice === 'number' ? `₹${product.sellingPrice.toFixed(2)}` : 'N/A'}
                            </TableCell>
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
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full flex-1">
                <Loader className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center text-center p-12 gap-4">
                    <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                    <CardDescription>
                        There was a problem fetching product data. Please try again later.
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }
    
    if (allProducts.length === 0 && !isSeeding) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center text-center p-12 gap-4">
                    <CardTitle>No Products Found</CardTitle>
                    <CardDescription>
                        It looks like there are no products in the database.
                        <br/>
                        You can seed some initial data or add products manually.
                    </CardDescription>
                    <div className="flex gap-4">
                        <Button onClick={handleSeedData} disabled={isSeeding}>
                            {isSeeding ? <Loader className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Seed Products
                        </Button>
                         <Button asChild>
                            <Link href="/admin/inventory/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                        Showing products for: <strong>{selectedBrand}</strong>
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        disabled={isUpdating || filteredProducts.length === 0}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </Button>
                    <Button asChild variant="outline" className="relative cursor-pointer bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-700">
                        <div>
                            <Upload className="mr-2 h-4 w-4" />
                            <span>{isUpdating ? 'Processing...' : 'Bulk Stock Update'}</span>
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                disabled={isUpdating}
                            />
                        </div>
                    </Button>
                     <Button asChild>
                        <Link href="/admin/inventory/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                     <Button variant="secondary" onClick={handleSeedData} disabled={isSeeding}>
                        {isSeeding ? <Loader className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Seed Products & Reviews
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
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

                    <TabsContent value="all" className="mt-0">
                        {renderTable(filteredProducts)}
                    </TabsContent>
                     <TabsContent value="out-of-stock" className="mt-0">
                        {renderTable(filteredProducts)}
                    </TabsContent>
                     <TabsContent value="low-stock" className="mt-0">
                        {renderTable(filteredProducts)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );

    
}
