
"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash, UploadCloud, X, PlusCircle } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import { Loader } from '../ui/loader';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import useBrandStore from '@/stores/brand-store';
import { ProductFormSchema, type ProductFormValues } from '@/lib/product-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  mode: 'create' | 'edit';
  existingProduct?: IProduct; // For edit mode
}

const CATEGORIES = ['Electronics', 'Apparel', 'Books', 'Home Goods', 'Health', 'Footwear', 'Accessories'];


export function ProductForm({ mode, existingProduct }: ProductFormProps) {
  const router = useRouter();
  const { selectedBrand } = useBrandStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues: ProductFormValues = existingProduct ? {
    ...existingProduct,
    variants: [], // TODO: Populate variants for editing
  } : {
    name: '',
    description: '',
    price: 0,
    category: '',
    brand: selectedBrand === 'All Brands' ? '' : selectedBrand,
    images: [],
    variants: [],
    stock: 0,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          appendImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const hasVariants = form.watch('variants').length > 0;

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    const url = mode === 'create' ? '/api/products' : `/api/products/${existingProduct?._id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${mode} product.`);
      }

      toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      router.push('/admin/inventory');
      router.refresh();

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Classic Cotton T-Shirt" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                    <CardContent>
                         <FormField control={form.control} name="images" render={() => (
                            <FormItem>
                                <FormLabel>Images</FormLabel>
                                <FormControl>
                                    <div className="w-full">
                                        <Input 
                                            id="image-upload"
                                            type="file" 
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileChange}
                                        />
                                         <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">PNG or JPG</p>
                                            </div>
                                        </label>
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {imageFields.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                        {imageFields.map((field, index) => (
                                            <div key={field.id} className="relative aspect-square">
                                                <Image src={field.value} alt={`Preview ${index}`} fill className="object-cover rounded-md" />
                                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormItem>
                         )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Variants</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {variantFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end p-4 border rounded-lg relative">
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-muted-foreground" onClick={() => removeVariant(index)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                                 <FormField control={form.control} name={`variants.${index}.size`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl><Input placeholder="e.g., M" {...field} /></FormControl>
                                    </FormItem>
                                 )} />
                                <FormField control={form.control} name={`variants.${index}.color`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl><Input placeholder="e.g., Blue" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        ))}
                         <Button type="button" variant="outline" onClick={() => appendVariant({ size: '', color: '', stock: 0 })}>
                            <PlusCircle className="mr-2" />
                            {variantFields.length > 0 ? 'Add another variant' : 'Add variants (e.g., size, color)'}
                        </Button>
                         {!hasVariants && (
                            <FormField control={form.control} name="stock" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl><Input type="number" placeholder="Enter stock quantity" {...field} /></FormControl>
                                    <FormDescription>Enter stock for this product if it has no variants.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                         )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <FormField control={form.control} name="brand" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
                    <CardContent>
                         <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2" />}
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
