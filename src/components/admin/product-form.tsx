
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
import { Trash, UploadCloud, X, PlusCircle, Sparkles } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import { Loader } from '../ui/loader';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import useBrandStore from '@/stores/brand-store';
import { ProductFormSchema, type ProductFormValues } from '@/lib/product-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import type { IBrand } from '@/models/brand.model';
import { getSEODescription } from '@/ai/flows/seo-description-flow';
import { autofillProductDetails } from '@/ai/flows/autofill-product-flow';

interface ProductFormProps {
  mode: 'create' | 'edit';
  existingProduct?: IProduct; // For edit mode
}

const CATEGORIES = [
    "Men Fashion",
    "Women Fashion",
    "Home & Living",
    "Kids & Toys",
    "Personal Care & Wellness",
    "Mobiles & Tablets",
    "Consumer Electronics",
    "Appliances",
    "Automotive",
    "Beauty & Personal Care",
    "Home Utility",
    "Kids",
    "Grocery",
    "Women",
    "Home & Kitchen",
    "Health & Wellness",
    "Beauty & Makeup",
    "Personal Care",
    "Men'S Grooming",
    "Craft & Office Supplies",
    "Sports & Fitness",
    "Automotive Accessories",
    "Pet Supplies",
    "Office Supplies & Stationery",
    "Industrial & Scientific Products",
    "Musical Instruments",
    "Books",
    "Eye Utility",
    "Bags, Luggage & Travel Accessories",
    "Mens Personal Care & Grooming"
];


export function ProductForm({ mode, existingProduct }: ProductFormProps) {
  const router = useRouter();
  const { selectedBrand, availableBrands: allStorefronts } = useBrandStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isAutofilling, setIsAutofilling] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  
  const storefronts = allStorefronts.filter(b => b !== 'All Brands');


  const defaultValues: ProductFormValues = existingProduct ? {
    ...existingProduct,
    mrp: existingProduct.mrp || '',
    sellingPrice: existingProduct.sellingPrice,
    storefront: existingProduct.storefront,
    variants: [], // TODO: Populate variants for editing
  } : {
    name: '',
    description: '',
    mrp: '',
    sellingPrice: 0,
    category: '',
    brand: '', // Product's actual brand
    storefront: selectedBrand === 'All Brands' ? (storefronts[0] || '') : selectedBrand,
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
  const productName = form.watch('name');

  const handleAIError = (error: any) => {
    const errorMessage = error.message || '';
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      setAiError("⚠️ AI service is overloaded. Please try again later or fill in the form manually.");
    } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
      setAiError("⚠️ AI request limit reached. Please try again later or fill in the form manually.");
    } else {
      setAiError("⚠️ AI service is unavailable. Please try again later.");
    }
    console.error(error);
  }

  const handleGenerateDescription = async () => {
      if (!productName) {
          toast.warn("Please enter a product name first.");
          return;
      }
      setAiError(null);
      setIsGenerating(true);
      try {
          const result = await getSEODescription({ productName });
          form.setValue('description', result.description, { shouldValidate: true });
          toast.success("AI description generated!");
      } catch (error) {
          handleAIError(error);
      } finally {
          setIsGenerating(false);
      }
  };
  
  const handleAutofill = async () => {
    if (!productName) {
      toast.warn("Please enter a product name to autofill the form.");
      return;
    }
    setAiError(null);
    setIsAutofilling(true);
    toast.info("Autofilling form with AI...");
    try {
      const result = await autofillProductDetails({ productName });
      form.setValue('description', result.description, { shouldValidate: true });
      form.setValue('mrp', result.mrp, { shouldValidate: true });
      form.setValue('sellingPrice', result.sellingPrice, { shouldValidate: true });
      form.setValue('category', result.category, { shouldValidate: true });
      form.setValue('brand', result.brand, { shouldValidate: true });
      form.setValue('stock', result.stock, { shouldValidate: true });
      toast.success("Form autofilled successfully!");
    } catch (error) {
      handleAIError(error);
    } finally {
      setIsAutofilling(false);
    }
  };


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
                                <div className="flex gap-2 items-start">
                                  <div className="flex-grow">
                                    <FormControl><Input placeholder="e.g., Classic Cotton T-Shirt" {...field} /></FormControl>
                                    <FormMessage />
                                  </div>
                                  <Button type="button" variant="outline" onClick={handleAutofill} disabled={isAutofilling || !productName}>
                                    {isAutofilling ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                                    Autofill
                                  </Button>
                                </div>
                            </FormItem>
                        )} />

                        {aiError && <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">{aiError}</p>}

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                 <div className="flex items-center justify-between">
                                    <FormLabel>Description</FormLabel>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || !productName}>
                                        {isGenerating ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                                        Generate with AI
                                    </Button>
                                </div>
                                <FormControl>
                                  <div className="rounded-md border border-input">
                                      <div className="border-b px-3 py-2 flex items-center gap-2">
                                          <Button type="button" variant="ghost" size="sm">Normal</Button>
                                          <Button type="button" variant="ghost" size="sm" className="font-bold">B</Button>
                                          <Button type="button" variant="ghost" size="sm" className="italic">I</Button>
                                          <Button type="button" variant="ghost" size="sm" className="underline">U</Button>
                                      </div>
                                      <Textarea 
                                          placeholder="Describe the product..." 
                                          {...field} 
                                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[150px]"
                                      />
                                  </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                         <FormField control={form.control} name="images" render={() => (
                            <FormItem>
                                <FormLabel>Images</FormLabel>
                                <FormControl>
                                    <div className="w-full">
                                        <Input 
                                            id="image-upload"
                                            type="file" 
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileChange}
                                        />
                                         <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
                                            </div>
                                        </label>
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {imageFields.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                        {imageFields.map((field, index) => (
                                            <div key={field.id} className="relative aspect-square">
                                                {field.value && <Image src={field.value} alt={`Preview ${index}`} fill className="object-cover rounded-md" />}
                                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormItem>
                         )} />

                        <FormItem>
                            <FormLabel>Videos</FormLabel>
                            <FormControl>
                                <div className="w-full">
                                    <Input 
                                        id="video-upload"
                                        type="file" 
                                        accept="video/mp4,video/webm,audio/mp3"
                                        className="hidden"
                                        multiple
                                        // onChange={handleVideoFileChange} // You would need a new handler for videos
                                    />
                                    <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">MP4, WEBM, or MP3</p>
                                        </div>
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                            {/* You would also need a way to display video previews here */}
                        </FormItem>
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
                                        <FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl>
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
                                    <FormControl><Input type="number" placeholder="Enter stock quantity" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
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
                        <FormField control={form.control} name="storefront" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Storefront</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a storefront" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {storefronts.map(store => <SelectItem key={store} value={store} className="capitalize">{store}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The storefront where this product will be displayed.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="brand" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Nike, Sony, Apple" {...field} />
                                </FormControl>
                                <FormDescription>The actual brand of the product.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
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
                    <CardContent className="grid grid-cols-2 gap-4">
                         <FormField control={form.control} name="mrp" render={({ field }) => (
                            <FormItem>
                                <FormLabel>MRP</FormLabel>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                                    </FormControl>
                                </div>
                                <FormDescription>Original price (optional).</FormDescription>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Selling Price</FormLabel>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                                    </FormControl>
                                </div>
                                 <FormDescription>The price it will be sold at.</FormDescription>
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
