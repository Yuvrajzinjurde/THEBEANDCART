
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
import useBrandStore from '@/stores/brand-store';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BoxIcon, PlusCircle, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const BoxFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    images: z.array(z.string().url()).min(1, "At least one image is required"),
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    storefront: z.string().min(1, "Storefront is required"),
});

type BoxFormValues = z.infer<typeof BoxFormSchema>;

export default function NewBoxPage() {
    const router = useRouter();
    const { selectedBrand, availableBrands } = useBrandStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const storefronts = availableBrands.filter(b => b !== 'All Brands');

    const form = useForm<BoxFormValues>({
        resolver: zodResolver(BoxFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            images: [],
            size: '',
            color: '',
            stock: 0,
            storefront: selectedBrand === 'All Brands' ? storefronts[0] || '' : selectedBrand,
        },
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: 'images' as never,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const filePromises = Array.from(files).map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(filePromises).then(newUrls => {
                const currentImages = form.getValues('images');
                form.setValue('images', [...currentImages, ...newUrls], { shouldValidate: true, shouldDirty: true });
            });
        }
    };
    

    async function onSubmit(data: BoxFormValues) {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/boxes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create box.");
            }

            toast.success("Box/Bag created successfully!");
            router.push('/admin/boxes');
            router.refresh();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2"><BoxIcon /> Create New Box or Bag</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Box/Bag Details</CardTitle>
                <CardDescription>
                Fill out the form to add a new packaging option.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Premium Gift Box" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                <FormDescription>The brand this packaging belongs to.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="size" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Size</FormLabel>
                                    <FormControl><Input placeholder="e.g., Medium" {...field} /></FormControl>
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl><Input placeholder="e.g., Black" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="stock" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                         <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea placeholder="Describe the item..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <FormField
                            control={form.control}
                            name="images"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Images</FormLabel>
                                    <FormControl>
                                        <div className="w-full">
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    {form.watch('images').length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            {form.watch('images').map((url, index) => (
                                                <div key={index} className="relative aspect-square">
                                                    <Image src={url} alt={`Preview ${index}`} fill className="object-cover rounded-md" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => form.setValue('images', form.getValues('images').filter((_, i) => i !== index))}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />
                         <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                                Create Item
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
