

"use client";

import React from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, UploadCloud, X, PlusCircle, Sparkles, GripVertical, Edit, Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import type { IProduct } from '@/models/product.model';
import { Loader } from '../ui/loader';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import useBrandStore from '@/stores/brand-store';
import { ProductFormSchemaForClient, type ProductFormValues } from '@/lib/product-schema';
import { themeColors } from '@/lib/brand-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import type { IBrand } from '@/models/brand.model';
import { getSEODescription } from '@/ai/flows/seo-description-flow';
import { autofillProductDetails } from '@/ai/flows/autofill-product-flow';
import { generateProductTags } from '@/ai/flows/generate-product-tags-flow';
import { suggestProductPrice } from '@/ai/flows/suggest-product-price-flow';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ProductCard } from '../product-card';
import { Badge } from '../ui/badge';
import usePlatformSettingsStore from '@/stores/platform-settings-store';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


const SortableImage = ({ id, url, onRemove, disabled }: { id: any; url: string; onRemove: () => void; disabled: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative aspect-square group">
            <div className="relative w-full h-full">
                {url && <Image src={url} alt={`Preview`} fill className="object-cover rounded-md" />}
                {!disabled && (
                    <>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={onRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                         <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="absolute bottom-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="h-4 w-4 text-white" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};


const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, append: (value: { value: string } | { value: string }[]) => void) => {
    const files = e.target.files;
    if (files) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<{ value: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ value: reader.result as string });
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises).then(newFiles => {
        append(newFiles);
      });
    }
};

const handleDragEnd = (event: DragEndEvent, moveFn: (from: number, to: number) => void) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
        const oldIndex = (active.data.current?.sortable.index) as number;
        const newIndex = (over?.data.current?.sortable.index) as number;
        moveFn(oldIndex, newIndex);
    }
};

const VariantItem = ({ control, index, removeVariant, disabled, generateSku, setValue }: { control: Control<ProductFormValues>; index: number; removeVariant: (index: number) => void; disabled: boolean; generateSku: () => string; setValue: any }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const { fields: variantImageFields, append: appendVariantImage, remove: removeVariantImage, move: moveVariantImage } = useFieldArray({
        control,
        name: `variants.${index}.images`,
    });
     const { fields: variantVideoFields, append: appendVariantVideo, remove: removeVariantVideo } = useFieldArray({
        control,
        name: `variants.${index}.videos`,
    });

    return (
        <div className="space-y-4 p-4 border rounded-lg relative">
            {!disabled && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-muted-foreground" onClick={() => removeVariant(index)}>
                    <Trash className="h-4 w-4" />
                </Button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <FormField control={control} name={`variants.${index}.size`} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Size</FormLabel>
                        <FormControl><Input placeholder="e.g., M" {...field} disabled={disabled} /></FormControl>
                    </FormItem>
                )} />
                <FormField control={control} name={`variants.${index}.color`} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl><Input placeholder="e.g., Blue" {...field} disabled={disabled} /></FormControl>
                    </FormItem>
                )} />
                <FormField control={control} name={`variants.${index}.sku`} render={({ field }) => (
                    <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                                <Input placeholder="e.g., TSHIRT-BL-M" {...field} disabled={disabled} />
                            </FormControl>
                            {!disabled && <Button type="button" variant="outline" onClick={() => setValue(`variants.${index}.sku`, generateSku())}>Generate</Button>}
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name={`variants.${index}.stock`} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} disabled={disabled} /></FormControl>
                    </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name={`variants.${index}.images`} render={() => (
                    <FormItem>
                        <FormLabel>Variant Images</FormLabel>
                         <FormControl>
                            <div>
                                <Input 
                                    id={`variant-image-upload-${index}`}
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => handleFileChange(e, appendVariantImage)}
                                    disabled={disabled}
                                />
                                {!disabled && (
                                    <label htmlFor={`variant-image-upload-${index}`} className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center">
                                            <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Upload images</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                        {variantImageFields.length > 0 && (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, moveVariantImage)}>
                                <SortableContext items={variantImageFields} strategy={rectSortingStrategy}>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {variantImageFields.map((imgField, imgIndex) => (
                                        imgField.value && <SortableImage key={imgField.id} id={imgField.id} url={imgField.value} onRemove={() => removeVariantImage(imgIndex)} disabled={disabled} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </FormItem>
                )} />
                 <FormField control={control} name={`variants.${index}.videos`} render={() => (
                    <FormItem>
                        <FormLabel>Variant Videos</FormLabel>
                        <FormControl>
                            <div>
                                <Input 
                                    id={`variant-video-upload-${index}`}
                                    type="file" 
                                    accept="video/*"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => handleFileChange(e, appendVariantVideo)}
                                    disabled={disabled}
                                />
                                 {!disabled && (
                                    <label htmlFor={`variant-video-upload-${index}`} className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center">
                                            <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Upload videos</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                        {variantVideoFields.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {variantVideoFields.map((vidField, vidIndex) => (
                                    <div key={vidField.id} className="relative aspect-square">
                                        {vidField.value && <video src={vidField.value} controls className="w-full h-full object-cover rounded-md bg-muted" />}
                                        {!disabled && (
                                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 z-10" onClick={() => removeVariantVideo(vidIndex)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </FormItem>
                )} />
            </div>
        </div>
    );
};



interface ProductFormProps {
    mode: 'create' | 'edit';
    existingProduct?: IProduct;
}

export function ProductForm({ mode, existingProduct }: ProductFormProps) {
  const router = useRouter();
  const { selectedBrand, availableBrands: allStorefronts } = useBrandStore();
  const { aiEnabled } = usePlatformSettingsStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = React.useState(false);
  const [isGeneratingPrice, setIsGeneratingPrice] = React.useState(false);
  const [isAutofilling, setIsAutofilling] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [tagInput, setTagInput] = React.useState('');
  
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewProduct, setPreviewProduct] = React.useState<Partial<IProduct> | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  
  const [isFormDisabled, setIsFormDisabled] = React.useState(mode === 'edit');
  const [isCancelAlertOpen, setIsCancelAlertOpen] = React.useState(false);
  
  const [productCategories, setProductCategories] = React.useState<string[]>([]);
  
  const storefronts = allStorefronts.filter(b => b !== 'All Brands');

  const defaultValues: ProductFormValues = existingProduct ? {
    ...existingProduct,
    sku: existingProduct.sku || '',
    category: Array.isArray(existingProduct.category) ? existingProduct.category[0] : existingProduct.category,
    images: existingProduct.images.map(img => ({value: img})),
    videos: (existingProduct as any).videos?.map((vid: string) => ({ value: vid })) || [],
    keywords: (existingProduct.keywords || []).map(keyword => ({ value: keyword })),
    mrp: existingProduct.mrp || '',
    sellingPrice: existingProduct.sellingPrice,
    purchasePrice: (existingProduct as any).purchasePrice || 0,
    storefront: existingProduct.storefront,
    returnPeriod: existingProduct.returnPeriod || 10,
    variants: [], // TODO: Populate variants for editing
  } : {
    name: '',
    description: '',
    sku: '',
    mrp: '',
    purchasePrice: 0,
    sellingPrice: 0,
    category: '',
    brand: '', // Product's actual brand
    storefront: selectedBrand === 'All Brands' ? (storefronts[0] || '') : selectedBrand,
    images: [],
    videos: [],
    keywords: [],
    returnPeriod: 10,
    variants: [],
    stock: 0,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchemaForClient),
    defaultValues,
    mode: 'onChange',
  });
  
  const { control, formState: { isDirty } } = form;

  const selectedStorefront = useWatch({ control: form.control, name: 'storefront' });

  React.useEffect(() => {
    async function fetchBrandCategories() {
        if (!selectedStorefront) return;
        try {
            const res = await fetch(`/api/brands/${selectedStorefront}`);
            if (res.ok) {
                const { brand } = await res.json();
                setProductCategories(brand.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories for brand', error);
            setProductCategories([]);
        }
    }
    fetchBrandCategories();
  }, [selectedStorefront]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { fields: imageFields, append: appendImage, remove: removeImage, move: moveImage } = useFieldArray({
    control,
    name: 'images',
  });

  const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({
    control,
    name: 'videos',
  });
  
  const { fields: keywordFields, append: appendKeyword, remove: removeKeyword } = useFieldArray({
    control,
    name: 'keywords',
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });
  
  const watchedFormValues = useWatch({ control });

  const generateSku = (name = '', color = '', size = '') => {
      const namePart = name.substring(0, 5).toUpperCase().replace(/\s+/g, '-');
      const colorPart = color.substring(0, 3).toUpperCase();
      const sizePart = size.toUpperCase();
      return [namePart, colorPart, sizePart].filter(Boolean).join('-');
  }

  const handleAIError = (error: any, context: string): string => {
    const errorMessage = error.message || '';
     const message = `⚠️ AI service failed during ${context}. Please try again later.`;
    let displayMessage = message;

    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      displayMessage = `${message} (Service Overloaded)`;
    } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
      displayMessage = `${message} (Request Limit Reached)`;
    }
    
    setAiError(displayMessage);
    console.error(error);
    return displayMessage;
  }

  const handleGenerateDescription = async () => {
      if (!watchedFormValues.name) {
          toast.warn("Please enter a product name first.");
          return;
      }
      setAiError(null);
      setIsGeneratingDesc(true);
      try {
          const result = await getSEODescription({ productName: watchedFormValues.name });
          form.setValue('description', result.description, { shouldValidate: true, shouldDirty: true });
          toast.success("AI description generated!");
      } catch (error) {
          const displayMessage = handleAIError(error, "description generation");
          toast.error(displayMessage);
      } finally {
          setIsGeneratingDesc(false);
      }
  };
  
  const handleGenerateTags = async () => {
    if (!watchedFormValues.name || !watchedFormValues.description) {
      toast.warn("Please enter a product name and description first.");
      return;
    }
    setAiError(null);
    setIsGeneratingTags(true);
    try {
      const result = await generateProductTags({ productName: watchedFormValues.name, description: watchedFormValues.description });
      const tagsAsObjects = result.tags.map(tag => ({ value: tag }));
      form.setValue('keywords', tagsAsObjects, { shouldValidate: true, shouldDirty: true });
      toast.success("AI keywords generated!");
    } catch (error) {
        const displayMessage = handleAIError(error, "keyword generation");
        toast.error(displayMessage);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleSuggestPrice = async () => {
    const { name, description, category, purchasePrice, images } = watchedFormValues;
    if (!name || !description || !category || !purchasePrice || !images || images.length === 0) {
        toast.warn("Please fill in Name, Description, Category, Purchase Price, and upload at least one image before suggesting a price.");
        return;
    }
    setAiError(null);
    setIsGeneratingPrice(true);
    try {
        const result = await suggestProductPrice({
            productName: name,
            description,
            category,
            purchasePrice: Number(purchasePrice),
            mainImage: images[0].value,
        });
        form.setValue('sellingPrice', result.suggestedPrice, { shouldValidate: true, shouldDirty: true });
        toast.success("AI selling price suggested!");
    } catch (error) {
        const displayMessage = handleAIError(error, "price suggestion");
        toast.error(displayMessage);
    } finally {
      setIsGeneratingPrice(false);
    }
  };


  const handleAutofill = async () => {
    if (!watchedFormValues.name) {
      toast.warn("Please enter a product name to autofill the form.");
      return;
    }
    setAiError(null);
    setIsAutofilling(true);
    toast.info("Autofilling form with AI...");
    try {
      const result = await autofillProductDetails({ productName: watchedFormValues.name });
      form.setValue('description', result.description, { shouldValidate: true, shouldDirty: true });
      form.setValue('mrp', result.mrp, { shouldValidate: true, shouldDirty: true });
      form.setValue('sellingPrice', result.sellingPrice, { shouldValidate: true, shouldDirty: true });
      form.setValue('category', result.category, { shouldValidate: true, shouldDirty: true });
      form.setValue('brand', result.brand, { shouldValidate: true, shouldDirty: true });
      form.setValue('stock', result.stock, { shouldValidate: true, shouldDirty: true });
      toast.success("Form autofilled successfully!");
    } catch (error) {
      const displayMessage = handleAIError(error, "autofill");
      toast.error(displayMessage);
    } finally {
      setIsAutofilling(false);
    }
  };
  
  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !keywordFields.some(field => field.value === newTag)) {
        appendKeyword({ value: newTag });
        setTagInput('');
      }
    }
  };


  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    const dataToSubmit = {
      ...data,
      images: watchedFormValues.variants.length > 0 ? [] : data.images.map(img => img.value), // Use top-level images only if no variants
      videos: data.videos?.map(vid => vid.value),
      keywords: data.keywords?.map(tag => tag.value),
      variants: data.variants.map(variant => ({
        ...variant,
        images: variant.images.map(img => img.value),
        videos: variant.videos?.map(vid => vid.value),
      })),
    };

    const url = mode === 'create' ? '/api/products' : `/api/products/${existingProduct?._id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${mode} product.`);
      }

      toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      setIsPreviewOpen(false);
      router.push('/admin/inventory');
      router.refresh();

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handlePreview = async () => {
    setFormError(null);
    const isValid = await form.trigger();
    if (!isValid) {
      setFormError("Please fill out all required fields before previewing.");
      return;
    }
    const formData = form.getValues();
    const mockProduct: Partial<IProduct> = {
        _id: 'preview-id',
        name: formData.name,
        category: formData.category,
        sellingPrice: Number(formData.sellingPrice),
        mrp: Number(formData.mrp) || undefined,
        images: formData.images.map(img => img.value),
        rating: 4.5, // Use a default rating for preview
    };
    setPreviewProduct(mockProduct);
    setIsPreviewOpen(true);
  };
  
  const handleCancel = () => {
    if (isDirty) {
      setIsCancelAlertOpen(true);
    } else {
      if (mode === 'edit') {
        setIsFormDisabled(true);
      } else {
        router.push('/admin/inventory');
      }
    }
  };

  const handleDiscardChanges = () => {
    form.reset(defaultValues);
    setIsCancelAlertOpen(false);
    setIsFormDisabled(true);
  };

  const activeTheme = themeColors.find(t => t.name.toLowerCase().includes(selectedStorefront.toLowerCase()));

  const previewStyle = activeTheme ? {
      '--background': activeTheme.background,
      '--foreground': '222.2 84% 4.9%', // Assuming dark text on light bg
      '--card': activeTheme.background,
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': activeTheme.background,
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': activeTheme.primary,
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96.1%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96.1%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': activeTheme.accent,
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '222.2 84% 4.9%',
      '--radius': '0.5rem',
  } as React.CSSProperties : {};


  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {mode === 'create' && (
             <CardHeader className="px-0">
                <CardTitle>Create New Product</CardTitle>
                <CardDescription>Fill in the details for your new product. Use the AI tools to speed up the process.</CardDescription>
            </CardHeader>
        )}

        {mode === 'edit' && (
            <div className="flex items-center justify-between">
                <CardTitle>{isFormDisabled ? 'View Product' : 'Edit Product'}</CardTitle>
                <Button type="button" variant="outline" size="icon" onClick={() => setIsFormDisabled(!isFormDisabled)}>
                    {isFormDisabled ? <Edit className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
            </div>
        )}
        
        <fieldset disabled={isFormDisabled} className="grid grid-cols-1 md:grid-cols-3 gap-6 group">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <div className="flex gap-2 items-start">
                                  <div className="flex-grow">
                                    <FormControl><Input placeholder="e.g., Classic Cotton T-Shirt" {...field} /></FormControl>
                                    <FormMessage />
                                  </div>
                                  <Button type="button" variant="outline" onClick={handleAutofill} disabled={!aiEnabled || isAutofilling || !watchedFormValues.name || isFormDisabled}>
                                    {isAutofilling ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                                    Autofill
                                  </Button>
                                </div>
                            </FormItem>
                        )} />

                        {aiError && <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">{aiError}</p>}

                        <FormField control={control} name="description" render={({ field }) => (
                            <FormItem>
                                 <div className="flex items-center justify-between">
                                    <FormLabel>Description</FormLabel>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={!aiEnabled || isGeneratingDesc || !watchedFormValues.name || isFormDisabled}>
                                        {isGeneratingDesc ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                                        Generate with AI
                                    </Button>
                                </div>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Describe the product... You can use HTML for styling." 
                                        {...field} 
                                        className="min-h-[150px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {!watchedFormValues.variants?.length && (
                <Card>
                    <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                         <FormField control={control} name="images" render={() => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel>Images</FormLabel>
                                    {!isFormDisabled && <FormDescription>Drag and drop to reorder images.</FormDescription>}
                                </div>
                                <FormControl>
                                    <div className="w-full">
                                        <Input 
                                            id="image-upload"
                                            type="file" 
                                            accept="image/png, image/jpeg, image/webp, image/avif"
                                            className="hidden"
                                            multiple
                                            onChange={(e) => handleFileChange(e, appendImage)}
                                            disabled={isFormDisabled}
                                        />
                                         {!isFormDisabled && (
                                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, or AVIF</p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {imageFields.length > 0 && (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, moveImage)}>
                                        <SortableContext items={imageFields} strategy={rectSortingStrategy}>
                                            <div className="grid grid-cols-4 gap-4 mt-4">
                                                {imageFields.map((field, index) => (
                                                   field.value && <SortableImage key={field.id} id={field.id} url={field.value} onRemove={() => removeImage(index)} disabled={isFormDisabled} />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </FormItem>
                         )} />

                        <FormField control={control} name="videos" render={() => (
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
                                            onChange={(e) => handleFileChange(e, appendVideo)}
                                            disabled={isFormDisabled}
                                        />
                                        {!isFormDisabled && (
                                            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">MP4, WEBM, or MP3</p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {videoFields.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                        {videoFields.map((field, index) => (
                                            <div key={field.id} className="relative aspect-square">
                                                {field.value && (
                                                    <video src={field.value} controls className="w-full h-full object-cover rounded-md bg-muted" />
                                                )}
                                                {!isFormDisabled && (
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 z-10" onClick={() => removeVideo(index)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormItem>
                         )} />
                    </CardContent>
                </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Variants</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {variantFields.map((field, index) => (
                            <VariantItem 
                                key={field.id} 
                                control={control} 
                                index={index} 
                                removeVariant={removeVariant} 
                                disabled={isFormDisabled} 
                                generateSku={() => generateSku(form.watch('name'), form.watch(`variants.${index}.color`), form.watch(`variants.${index}.size`))}
                                setValue={form.setValue}
                            />
                        ))}
                         {!isFormDisabled && (
                            <Button type="button" variant="outline" onClick={() => appendVariant({ size: '', color: '', sku: '', stock: 0, images: [], videos: [] })}>
                                <PlusCircle className="mr-2" />
                                {variantFields.length > 0 ? 'Add another variant' : 'Add variants (e.g., size, color)'}
                            </Button>
                         )}
                         {watchedFormValues.variants?.length === 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={control} name="sku" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                                         <div className="flex gap-2">
                                            <FormControl>
                                                <Input placeholder="e.g., TSHIRT-CLASSIC-WHT" {...field} />
                                            </FormControl>
                                             {!isFormDisabled && <Button type="button" variant="outline" onClick={() => form.setValue('sku', generateSku(form.watch('name')))}>Generate</Button>}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={control} name="stock" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl><Input type="number" placeholder="Enter stock quantity" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                        <FormDescription>Stock for this product if it has no variants.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={control} name="storefront" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Storefront</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
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
                        <FormField control={control} name="brand" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Nike, Sony, Apple" {...field} />
                                </FormControl>
                                <FormDescription>The actual brand of the product.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {productCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={control} name="keywords" render={() => (
                            <FormItem>
                                 <div className="flex items-center justify-between">
                                    <FormLabel>Keywords</FormLabel>
                                     <Button type="button" variant="ghost" size="sm" onClick={handleGenerateTags} disabled={!aiEnabled || isGeneratingTags || !watchedFormValues.name || !watchedFormValues.description || isFormDisabled}>
                                        {isGeneratingTags ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                                        Generate Keywords
                                    </Button>
                                </div>
                                 <FormControl>
                                    <div>
                                        <Input
                                            placeholder="Add a keyword and press Enter"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            disabled={isFormDisabled}
                                        />
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {keywordFields.map((keywordField, index) => (
                                                <Badge key={keywordField.id} variant="secondary" className="flex items-center gap-1">
                                                    {keywordField.value}
                                                    {!isFormDisabled && (
                                                        <button type="button" onClick={() => removeKeyword(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </FormControl>
                                 <FormDescription>Product keywords for search and filtering.</FormDescription>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Pricing & Policy</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        <FormField control={control} name="purchasePrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Purchase Price</FormLabel>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="sellingPrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Selling Price</FormLabel>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-grow">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                                        </FormControl>
                                    </div>
                                    <Button type="button" variant="outline" onClick={handleSuggestPrice} disabled={!aiEnabled || isGeneratingPrice || isFormDisabled}>
                                        {isGeneratingPrice ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                                        Suggest
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={control} name="mrp" render={({ field }) => (
                            <FormItem>
                                <FormLabel>MRP (Maximum Retail Price)</FormLabel>
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
                         <FormField control={control} name="returnPeriod" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Return Period (Days)</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 10" {...field} />
                                    </FormControl>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">days</span>
                                </div>
                                <FormDescription>Number of days customer has to return the product.</FormDescription>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </CardContent>
                </Card>
            </div>
        </fieldset>

        {!isFormDisabled && (
            <div className="flex flex-col items-end gap-4 pt-6">
                {formError && (
                    <Alert variant="destructive" className="w-full">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                    <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <AlertDialogTrigger asChild>
                            <Button type="button" onClick={handlePreview}>
                                {mode === 'create' ? 'Create Product' : 'Save Changes'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-2xl" style={previewStyle}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Product Preview</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This is how your product card will appear on the storefront.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            
                            <div className="flex justify-center p-8 bg-background rounded-lg">
                                {previewProduct && (
                                    <ProductCard product={previewProduct as IProduct} className="w-full max-w-[280px]" />
                                )}
                            </div>
                            
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                                <AlertDialogAction onClick={onSubmit} disabled={isSubmitting}>
                                    {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                                    {isSubmitting ? 'Saving...' : 'Confirm & Save'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        )}
        
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes. Are you sure you want to discard them?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep Editing</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDiscardChanges}>Yes, Discard</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}
