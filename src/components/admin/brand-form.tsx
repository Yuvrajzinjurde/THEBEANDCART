

"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, UploadCloud, X, Star } from 'lucide-react';
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

interface BrandFormProps {
  mode: 'create' | 'edit';
  existingBrand?: IBrand;
}

export function BrandForm({ mode, existingBrand }: BrandFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState('');

  const defaultValues: Partial<BrandFormValues> = existingBrand ? {
    displayName: existingBrand.displayName,
    permanentName: existingBrand.permanentName,
    logoUrl: existingBrand.logoUrl,
    banners: existingBrand.banners,
    themeName: existingBrand.themeName,
    offers: existingBrand.offers,
    reviews: existingBrand.reviews,
    promoBanner: existingBrand.promoBanner,
    categoryBanners: existingBrand.categoryBanners,
    categories: existingBrand.categories,
  } : {
    displayName: '',
    permanentName: '',
    logoUrl: '',
    banners: [{ title: '', description: '', imageUrl: '', imageHint: '' }],
    themeName: undefined,
    offers: [],
    reviews: [],
    categoryBanners: [],
    categories: [],
  };

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandFormSchema),
    defaultValues,
    mode: 'onChange', // Validate on change
  });

  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control: form.control,
    name: 'banners',
  });
  
  const { fields: offerFields, append: appendOffer, remove: removeOffer } = useFieldArray({
    control: form.control,
    name: 'offers',
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control: form.control,
    name: 'reviews',
  });

  const { fields: categoryBannerFields, append: appendCategoryBanner, remove: removeCategoryBanner } = useFieldArray({
    control: form.control,
    name: 'categoryBanners',
  });
  
  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: 'categories',
  });


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCategoryKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newCategory = categoryInput.trim();
      const currentCategories = form.getValues('categories') || [];
      if (newCategory && !currentCategories.includes(newCategory)) {
        appendCategory(newCategory);
        setCategoryInput('');
      }
    }
  };


  async function onSubmit(data: BrandFormValues) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
          <CardContent className="space-y-6">
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
                    <FormDescription>
                        This is the unique ID for the brand and will be used in the URL. It cannot be changed once set.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
                                    onChange={(e) => handleFileChange(e, field.onChange)} 
                                />
                                {field.value ? (
                                    <div className="relative w-48 h-48 border-2 border-dashed rounded-lg p-2">
                                        <Image src={field.value} alt="Logo preview" fill objectFit="contain" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => field.onChange('')}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
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
                                                {/* @ts-ignore */}
                                                {field.value}
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
                <CardTitle>Homepage Banners</CardTitle>
                <CardDescription>Add at least one banner for the homepage carousel. Recommended size: 1600x400px.</CardDescription>
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
                            name={`banners.${index}.title`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`banners.${index}.description`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`banners.${index}.imageUrl`}
                            render={({ field: imageField }) => (
                                <FormItem>
                                    <FormLabel>Banner Image</FormLabel>
                                    <FormControl>
                                       <div className="w-full">
                                            <Input
                                                id={`banner-upload-${index}`}
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, imageField.onChange)}
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
                                                        <p className="text-xs text-muted-foreground">PNG or JPG (1600x400px recommended)</p>
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
                                <FormItem><FormLabel>Image Hint (for AI)</FormLabel><FormControl><Input placeholder="e.g. 'fashion model'" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendBanner({ title: '', description: '', imageUrl: '', imageHint: '' })}>Add Banner</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Category Banners</CardTitle>
                <CardDescription>Manage the category grid banners for the main landing page. A total of 9 banners are needed for the grid layout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {categoryBannerFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                         <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeCategoryBanner(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`categoryBanners.${index}.categoryName`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input placeholder="e.g., Skincare" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`categoryBanners.${index}.imageHint`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g., 'skincare products'" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name={`categoryBanners.${index}.imageUrl`}
                            render={({ field: imageField }) => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                       <div className="w-full">
                                            <Input
                                                id={`cat-banner-upload-${index}`}
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, imageField.onChange)}
                                            />
                                            {imageField.value ? (
                                                <div className="relative w-48 h-48 border-2 border-dashed rounded-lg p-2">
                                                    <Image src={imageField.value} alt="Category banner preview" fill objectFit="cover" className="rounded-md" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6"
                                                        onClick={() => imageField.onChange('')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label htmlFor={`cat-banner-upload-${index}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendCategoryBanner({ categoryName: '', imageUrl: '', imageHint: '' })}>Add Category Banner</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Offers</CardTitle>
                <CardDescription>Add special offers to display on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {offerFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeOffer(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <FormField control={form.control} name={`offers.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`offers.${index}.description`} render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`offers.${index}.code`} render={({ field }) => (
                            <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendOffer({ title: '', description: '', code: '' })}>Add Offer</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Promotional Banner</CardTitle>
                <CardDescription>A large banner to highlight a special campaign or collection. Recommended size: 1200x600px.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={form.control} name="promoBanner.title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="promoBanner.description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="promoBanner.imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image</FormLabel>
                         <FormControl>
                           <div className="w-full">
                                <Input id="promo-banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, field.onChange)} />
                                {field.value ? (
                                    <div className="relative w-full aspect-[2/1] border-2 border-dashed rounded-lg p-2">
                                        <Image src={field.value} alt="Promo banner preview" fill objectFit="cover" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => field.onChange('')}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <label htmlFor="promo-banner-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="promoBanner.imageHint" render={({ field }) => (
                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g. 'summer collection'" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="promoBanner.buttonText" render={({ field }) => (
                        <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="promoBanner.buttonLink" render={({ field }) => (
                        <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
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
                        <div className="flex items-start gap-4">
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
                            <div className="flex-grow space-y-4">
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
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button type="button" disabled={!form.formState.isValid || isSubmitting}>
                 {mode === 'create' ? 'Create Brand' : 'Save Changes'}
              </Button>
          </AlertDialogTrigger>
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
  );
}
