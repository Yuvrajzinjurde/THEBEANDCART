

"use client";

import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, UploadCloud, X, Star, Crop, PlusCircle } from 'lucide-react';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '../ui/loader';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from 'next/image';
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
} from "@/components/ui/alert-dialog"
import { BrandFormSchema, type BrandFormValues, themeColors } from '@/lib/brand-schema';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/crop-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BrandFormProps {
  mode: 'create' | 'edit';
  existingBrand?: IBrand;
}

const ImageCropDialog = ({
  imageUrl,
  onCropComplete,
  onClose,
}: {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onClose: () => void;
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!croppedAreaPixels || !imageUrl) return;
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image. Please try again.");
    }
  }, [croppedAreaPixels, imageUrl, onCropComplete]);

  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Adjust Logo</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-80 bg-muted rounded-md">
                <Cropper
                    image={imageUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    cropShape="round"
                    showGrid={false}
                />
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm">Zoom</span>
                <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(newZoom) => setZoom(newZoom[0])}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveCrop}>Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};


export function BrandForm({ mode, existingBrand }: BrandFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState('');
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [uncroppedLogo, setUncroppedLogo] = useState<string | null>(null);

  const defaultValues: Partial<BrandFormValues> = React.useMemo(() => {
     if (existingBrand) {
        const brand = existingBrand as any; 
        return {
            ...brand,
            themeName: brand.themeName || 'Rose',
            promoBanner: {
                imageUrl: brand.promoBanner?.imageUrl || '',
                imageHint: brand.promoBanner?.imageHint || '',
                buttonLink: brand.promoBanner?.buttonLink || '',
            },
            categoryGrid: brand.categoryGrid || [],
        };
    }
    return {
        displayName: "Aura",
        permanentName: "aura",
        logoUrl: "https://picsum.photos/seed/aurora-logo/200/200",
        themeName: "Rose",
        categories: ["Wellness", "Skincare", "Makeup", "Haircare", "Fragrance", "Body Care", "Men's Grooming", "Beauty Tools"],
        banners: [
            { imageUrl: "https://picsum.photos/seed/natural-glow/1600/400", imageHint: "skincare model", buttonLink: "#" },
            { imageUrl: "https://picsum.photos/seed/summer-radiance/1600/400", imageHint: "summer beach", buttonLink: "#" },
        ],
        categoryGrid: [],
        promoBanner: {
            imageUrl: "https://picsum.photos/seed/promo-offer/1600/400",
            imageHint: "beauty products",
            buttonLink: "#",
        },
        reviews: [
            { customerName: "Priya S.", rating: 5, reviewText: "The Vitamin C serum is a game changer! My skin has never felt brighter.", customerAvatarUrl: "https://picsum.photos/seed/priya/100/100" },
            { customerName: "Rahul M.", rating: 4, reviewText: "Great products, especially the men's line. The beard oil is fantastic.", customerAvatarUrl: "https://picsum.photos/seed/rahul/100/100" },
            { customerName: "Anjali K.", rating: 5, reviewText: "I'm in love with the fragrances. They last all day and are so unique!", customerAvatarUrl: "https://picsum.photos/seed/anjali/100/100" },
        ],
    };
  }, [existingBrand]);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  React.useEffect(() => {
    if (existingBrand) {
        const brandData = {
            ...existingBrand,
            themeName: existingBrand.themeName || 'Rose',
            promoBanner: {
                imageUrl: existingBrand.promoBanner?.imageUrl || '',
                imageHint: existingBrand.promoBanner?.imageHint || '',
                buttonLink: existingBrand.promoBanner?.buttonLink || '',
            },
            categoryGrid: existingBrand.categoryGrid || [],
        };
        form.reset(brandData);
    }
  }, [existingBrand, form]);

  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control: form.control,
    name: 'banners',
  });
  
  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control: form.control,
    name: 'reviews',
  });
  
  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: 'categories',
  });

   const { fields: gridItemFields, append: appendGridItem, remove: removeGridItem } = useFieldArray({
    control: form.control,
    name: 'categoryGrid',
  });


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void, dimensions?: { width: number, height: number }) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const image = new window.Image();
        image.src = loadEvent.target?.result as string;
        image.onload = () => {
          if (dimensions && (image.width !== dimensions.width || image.height !== dimensions.height)) {
            toast.error(`Image must be ${dimensions.width}x${dimensions.height}px.`);
            return;
          }
          onChange(reader.result as string);
        };
      };
      reader.readAsDataURL(file);
    }
  };
    
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUncroppedLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImageUrl: string) => {
    form.setValue('logoUrl', croppedImageUrl, { shouldDirty: true, shouldValidate: true });
    setUncroppedLogo(null);
  }
  
  const handleCategoryKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newCategory = categoryInput.trim();
      if (newCategory && !(form.getValues('categories') || []).includes(newCategory)) {
        appendCategory(newCategory);
        setCategoryInput('');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAlertOpen(true);
  }

  async function onSubmit(data: BrandFormValues) {
    setIsAlertOpen(false);
    setIsSubmitting(true);
    const url = mode === 'create' ? '/api/brands' : `/api/brands/${existingBrand?.permanentName}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${mode} brand.`);
      }

      toast.success(`Brand ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      router.push('/admin/brands');
      router.refresh();

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const isFormDirty = form.formState.isDirty;

  const availableCategories = form.watch('categories') || [];


  return (
    <>
    {uncroppedLogo && (
        <ImageCropDialog 
            imageUrl={uncroppedLogo}
            onCropComplete={onCropComplete}
            onClose={() => setUncroppedLogo(null)}
        />
    )}
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl><Input placeholder="Reeva" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="permanentName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Permanent Name</FormLabel>
                        <FormControl><Input placeholder="reeva" {...field} disabled={mode === 'edit'} /></FormControl>
                         <FormDescription>Unique ID in URL. Cannot be changed.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                            <div className="w-full">
                                <Input 
                                    id="logo-upload"
                                    type="file" 
                                    accept="image/png, image/jpeg"
                                    className="hidden"
                                    onChange={handleLogoFileChange} 
                                />
                                {field.value ? (
                                    <div className="relative group w-48 h-48 rounded-full border-2 border-dashed p-1">
                                        <Image src={field.value} alt="Logo preview" fill objectFit="cover" className="rounded-full" />
                                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                           <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-9 w-9 rounded-full"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                            >
                                                <Crop className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-9 w-9 rounded-full"
                                                onClick={() => field.onChange('')}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG or JPG (200x200px recommended)</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add or remove product categories for this brand.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                        <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <FormControl>
                                <div>
                                    <Input
                                        placeholder="Add a category and press Enter"
                                        value={categoryInput}
                                        onChange={(e) => setCategoryInput(e.target.value)}
                                        onKeyDown={handleCategoryKeyDown}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {categoryFields.map((field, index) => (
                                            <Badge key={field.id} variant="secondary" className="flex items-center gap-1 capitalize">
                                                {form.getValues('categories')?.[index]}
                                                <button type="button" onClick={() => removeCategory(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </FormControl>
                            <FormDescription>These categories will appear in the product filters and forms for this brand.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Image Grid</CardTitle>
            <CardDescription>Manage the filterable content grid on the brand homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {gridItemFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove this category's content from the grid. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeGridItem(index)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <FormField control={form.control} name={`categoryGrid.${index}.category`} render={({ field }) => ( <FormItem><FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{['All', ...availableCategories].map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name={`categoryGrid.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name={`categoryGrid.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name={`categoryGrid.${index}.buttonLink`} render={({ field }) => ( <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input placeholder="e.g. /category/new-arrivals" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
                
                <FormField
                    control={form.control}
                    name={`categoryGrid.${index}.images`}
                    render={({ field: imageArrayField }) => {
                        const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            if (files) {
                                const filePromises = Array.from(files).slice(0, 8 - (imageArrayField.value?.length || 0)).map(file => {
                                    return new Promise<{ url: string; hint: string }>((resolve) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            resolve({ url: reader.result as string, hint: file.name });
                                        };
                                        reader.readAsDataURL(file);
                                    });
                                });
                                Promise.all(filePromises).then(newImages => {
                                    const currentImages = imageArrayField.value || [];
                                    imageArrayField.onChange([...currentImages, ...newImages]);
                                });
                            }
                        };
                        
                        const removeImage = (imgIndex: number) => {
                             const currentImages = imageArrayField.value || [];
                             imageArrayField.onChange(currentImages.filter((_, i) => i !== imgIndex));
                        }

                        return (
                            <FormItem>
                                <FormLabel>Images (up to 8)</FormLabel>
                                <FormControl>
                                    <div className="w-full">
                                        <Input id={`grid-image-upload-${index}`} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFilesChange} />
                                        <div className="grid grid-cols-4 gap-2">
                                            {(imageArrayField.value || []).map((img, imgIndex) => (
                                                <div key={imgIndex} className="relative w-full aspect-square border-2 border-dashed rounded-lg p-1">
                                                    <Image src={img.url} alt="Grid item preview" fill objectFit="contain" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5" onClick={() => removeImage(imgIndex)}><X className="h-3 w-3" /></Button>
                                                </div>
                                            ))}
                                             {(imageArrayField.value?.length || 0) < 8 && (
                                                <label htmlFor={`grid-image-upload-${index}`} className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground mt-1">Upload</p>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
              </div>
            ))}
             <Button type="button" variant="outline" onClick={() => appendGridItem({ category: '', title: '', description: '', images: [], buttonLink: '' })}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Category Content
            </Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Homepage Hero Banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {bannerFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently remove this banner. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeBanner(index)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                       
                        <FormField
                            control={form.control}
                            name={`banners.${index}.buttonLink`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Banner Link (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://example.com/collection" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`banners.${index}.imageUrl`}
                            render={({ field: imageField }) => (
                                <FormItem>
                                    <FormLabel>Banner Image</FormLabel>
                                    <FormDescription>Required dimensions: 1600x400px</FormDescription>
                                    <FormControl>
                                       <div className="w-full">
                                            <Input
                                                id={`banner-upload-${index}`}
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, imageField.onChange, { width: 1600, height: 400 })}
                                            />
                                            {imageField.value ? (
                                                <div className="relative w-full aspect-[4/1] border-2 border-dashed rounded-lg p-2">
                                                    <Image src={imageField.value} alt="Banner preview" fill objectFit="cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-6 w-6"
                                                        onClick={() => imageField.onChange('')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label htmlFor={`banner-upload-${index}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground">Required dimensions: 1600x400px</p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`banners.${index}.imageHint`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Image Hint (for AI)</FormLabel><FormControl><Input placeholder="e.g., 'fashion model'" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendBanner({ title: '', description: '', imageUrl: '', imageHint: '', buttonLink: '' })}>Add Banner</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Promotional Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="promoBanner.buttonLink" render={({ field }) => (
                    <FormItem><FormLabel>Button Link (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://example.com/sale" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="promoBanner.imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormDescription>Required dimensions: 1600x400px</FormDescription>
                         <FormControl>
                           <div className="w-full">
                                <Input id="promo-banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, field.onChange, { width: 1600, height: 400 })} />
                                {field.value ? (
                                    <div className="relative w-full aspect-[4/1] border-2 border-dashed rounded-lg p-2">
                                        <Image src={field.value} alt="Promo banner preview" fill objectFit="cover" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => field.onChange('')}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <label htmlFor="promo-banner-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                            <p className="text-xs text-muted-foreground">Required dimensions: 1600x400px</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="promoBanner.imageHint" render={({ field }) => (
                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g., 'summer collection'" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Showcase testimonials from happy customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {reviewFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                         <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeReview(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <FormField control={form.control} name={`reviews.${index}.customerAvatarUrl`} render={({ field }) => (
                                <FormItem className="flex-shrink-0">
                                    <FormLabel>Avatar</FormLabel>
                                    <FormControl>
                                        <div>
                                            <Input id={`avatar-upload-${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, field.onChange)} />
                                            <label htmlFor={`avatar-upload-${index}`} className="cursor-pointer">
                                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border overflow-hidden">
                                                    {field.value ? <Image src={field.value} alt="Avatar" width={64} height={64} className="object-cover" /> : <UploadCloud className="w-6 h-6 text-muted-foreground" />}
                                                </div>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`reviews.${index}.customerName`} render={({ field }) => (
                                    <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name={`reviews.${index}.rating`} render={({ field }) => (
                                    <FormItem><FormLabel>Rating (1-5)</FormLabel><FormControl><Input type="number" min="1" max="5" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>
                        <FormField control={form.control} name={`reviews.${index}.reviewText`} render={({ field }) => (
                            <FormItem><FormLabel>Review Text</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => appendReview({ customerName: '', rating: 5, reviewText: '', customerAvatarUrl: '' })}>Add Review</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Theme</CardTitle><CardDescription>Select a color scheme for the brand's storefront.</CardDescription></CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="themeName"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                             <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                >
                                    {themeColors.map((theme) => (
                                    <FormItem key={theme.name}>
                                        <FormLabel htmlFor={`theme-${theme.name}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer w-full">
                                            <RadioGroupItem value={theme.name} id={`theme-${theme.name}`} className="sr-only" />
                                            <div className="flex items-center gap-2">
                                                <span style={{ backgroundColor: `hsl(${theme.primary})` }} className="h-6 w-6 rounded-full"></span>
                                                <span style={{ backgroundColor: `hsl(${theme.accent})` }} className="h-6 w-6 rounded-full"></span>
                                                <span style={{ backgroundColor: `hsl(${theme.background})`, border: '1px solid #ccc' }} className="h-6 w-6 rounded-full"></span>
                                            </div>
                                            <span className="mt-2 text-sm font-medium">{theme.name}</span>
                                        </FormLabel>
                                    </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={isSubmitting || (mode === 'edit' && !isFormDirty)}>
            {mode === 'create' ? 'Create Brand' : 'Save Changes'}
        </Button>

         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will {mode === 'create' ? 'create a new brand' : 'save the changes'}.
                        {mode === 'create' && " The permanent name cannot be changed after creation."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : null}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
    </>
  );
}
