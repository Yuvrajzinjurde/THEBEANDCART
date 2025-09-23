

"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, UploadCloud, X, Home, Save, Bot, Gift, Sparkles, Twitter, Facebook, Instagram, Linkedin, Palette, Tv, PlusCircle } from 'lucide-react';
import { PlatformSettingsValidationSchema, type PlatformSettingsValues, themeColors, type Theme } from '@/lib/brand-schema';
import { Loader } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import usePlatformSettingsStore from '@/stores/platform-settings-store';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { IProduct } from '@/models/product.model';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const staticDefaultValues: PlatformSettingsValues = {
  platformName: 'The Brand Cart',
  platformLogoUrl: '',
  platformFaviconUrl: '',
  theme: themeColors.find(t => t.name === 'Blue') as Theme,
  socials: { twitter: '', facebook: '', instagram: '', linkedin: '' },
  aiEnabled: true,
  hamperFeatureEnabled: true,
  promoBannerEnabled: true,
  heroBanners: [
    {
      title: "Elevate Your Style",
      description: "Discover curated collections from the world's most innovative brands.",
      imageUrl: "https://picsum.photos/seed/style-elevate/1600/400",
      imageHint: "fashion collection",
    },
  ],
  featuredCategories: [],
  promoBanner: {
    title: "Mid-Season Mega Sale",
    description: "Unbeatable deals on your favorite brands. Get up to 60% off on selected items before they're gone!",
    imageUrl: "https://picsum.photos/seed/mega-sale/1200/600",
    imageHint: "shopping discount",
    buttonText: "Explore Deals",
    buttonLink: "/#",
  },
};


export default function PlatformSettingsPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { settings, fetchSettings } = usePlatformSettingsStore();
  
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');


  const form = useForm<PlatformSettingsValues>({
    resolver: zodResolver(PlatformSettingsValidationSchema),
    defaultValues: staticDefaultValues,
    mode: 'onChange',
  });
  
  useEffect(() => {
    const fetchAndSetSettings = async () => {
        setIsLoading(true);
        try {
            // Fetch products to determine categories
            const productResponse = await fetch('/api/products?limit=2000');
            if (productResponse.ok) {
                const productData = await productResponse.json();
                const products: IProduct[] = productData.products;
                const categorySet = new Set<string>();
                 products.forEach(p => {
                    if (p.category && typeof p.category === 'string') {
                        categorySet.add(p.category);
                    } else if (p.category && Array.isArray(p.category)) {
                        p.category.forEach(cat => {
                            if(typeof cat === 'string') categorySet.add(cat)
                        });
                    }
                });
                setAvailableCategories(Array.from(categorySet).sort());
            }

            const response = await fetch('/api/platform');
            if (response.ok) {
                const settingsData = await response.json();
                if (settingsData) {
                    const defaultSocials = { twitter: '', facebook: '', instagram: '', linkedin: '' };
                    const defaultPromoBanner = { title: '', description: '', imageUrl: '', imageHint: '', buttonText: '', buttonLink: '' };

                    const sanitizedSettings: PlatformSettingsValues = {
                        ...staticDefaultValues,
                        ...settingsData,
                        platformName: settingsData.platformName || '',
                        platformLogoUrl: settingsData.platformLogoUrl || '',
                        platformFaviconUrl: settingsData.platformFaviconUrl || '',
                        theme: settingsData.theme || themeColors.find(t => t.name === 'Blue'),
                        socials: { ...defaultSocials, ...(settingsData.socials || {}) },
                        featuredCategories: settingsData.featuredCategories || [],
                        heroBanners: settingsData.heroBanners && settingsData.heroBanners.length > 0 ? settingsData.heroBanners : staticDefaultValues.heroBanners,
                        promoBanner: { ...defaultPromoBanner, ...(settingsData.promoBanner || {}) },
                    };
                    form.reset(sanitizedSettings);
                } else {
                     form.reset(staticDefaultValues);
                }
            } else {
                 form.reset(staticDefaultValues);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Could not load initial data. Displaying default values.");
            form.reset(staticDefaultValues);
        } finally {
            setIsLoading(false);
        }
    }
    fetchAndSetSettings();
  }, [form]);

  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control: form.control,
    name: 'heroBanners',
  });
  
  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: 'featuredCategories',
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
  
  
  async function onSubmit(data: PlatformSettingsValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to save settings.`);
      }

      toast.success(`Platform settings saved successfully!`);
      
      await fetchSettings();
      
      form.reset(result, { keepDirty: false });

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Home /> Platform Settings</CardTitle>
                <CardDescription>Manage the content and appearance of the main public-facing landing page.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64"><Loader /></CardContent>
        </Card>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2"><Home /> Platform Settings</CardTitle>
                    <CardDescription>Manage the global identity, content, and features of your platform.</CardDescription>
                </div>
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                    {isSubmitting && <Loader className="mr-2" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardHeader>
        </Card>
        
         <Card>
          <CardHeader>
            <CardTitle>Global Identity</CardTitle>
            <CardDescription>Manage your platform's main branding elements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="platformName" render={({ field }) => (
                <FormItem><FormLabel>Platform Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="platformLogoUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Platform Logo</FormLabel>
                         <FormControl>
                            <div className="w-full">
                                <Input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, field.onChange)} />
                                {field.value ? (
                                    <div className="relative w-48 h-48 border-2 border-dashed rounded-lg p-2">
                                        <Image src={field.value} alt="Logo preview" fill objectFit="contain" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => field.onChange('')}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="platformFaviconUrl" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Platform Favicon</FormLabel>
                         <FormControl>
                            <div className="w-full">
                                <Input id="favicon-upload" type="file" accept="image/x-icon, image/png, image/svg+xml" className="hidden" onChange={(e) => handleFileChange(e, field.onChange)} />
                                {field.value ? (
                                    <div className="relative w-48 h-48 border-2 border-dashed rounded-lg p-2">
                                        <Image src={field.value} alt="Favicon preview" fill objectFit="contain" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => field.onChange('')}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <label htmlFor="favicon-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
             </div>
             <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Palette/> Platform Theme</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={(value) => {
                                    const selectedTheme = themeColors.find(t => t.name === value);
                                    if (selectedTheme) {
                                        field.onChange(selectedTheme);
                                    }
                                }}
                                value={field.value?.name}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                            >
                                {themeColors.map((theme) => {
                                    const isSelected = field.value && field.value.name === theme.name;
                                    return(
                                        <FormItem key={theme.name}>
                                            <FormLabel htmlFor={`theme-${theme.name}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer w-full h-full" data-state={isSelected ? "checked" : "unchecked"}>
                                                <RadioGroupItem value={theme.name} id={`theme-${theme.name}`} className="sr-only" checked={isSelected} />
                                                <div className="flex items-center gap-2">
                                                    <span style={{ backgroundColor: `hsl(${theme.primary})` }} className="h-6 w-6 rounded-full"></span>
                                                    <span style={{ backgroundColor: `hsl(${theme.accent})` }} className="h-6 w-6 rounded-full"></span>
                                                    <span style={{ backgroundColor: `hsl(${theme.background})`, border: '1px solid #ccc' }} className="h-6 w-6 rounded-full"></span>
                                                </div>
                                                <span className="mt-2 text-sm font-medium">{theme.name}</span>
                                            </FormLabel>
                                        </FormItem>
                                    )
                                })}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Controls</CardTitle>
            <CardDescription>Enable or disable major features across the entire platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="aiEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2"><Sparkles /> Enable AI Features</FormLabel>
                    <FormDescription>Turn on/off AI-powered buttons like 'Autofill', 'Suggest', and 'Generate'.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="hamperFeatureEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2"><Gift /> Enable Hamper Creation</FormLabel>
                    <FormDescription>Show or hide the 'Create Your Own Hamper' section on the main landing page.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="promoBannerEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2"><Tv /> Enable Promotional Banner</FormLabel>
                    <FormDescription>Show or hide the large promotional banner on the main landing page.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Homepage Hero Banners</CardTitle>
                <CardDescription>Manage the carousel banners on the main landing page. Recommended dimensions: 1600x200px.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {bannerFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeBanner(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <FormField control={form.control} name={`heroBanners.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name={`heroBanners.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                         <FormField control={form.control} name={`heroBanners.${index}.imageUrl`} render={({ field: imageField }) => (
                            <FormItem>
                                <FormLabel>Banner Image</FormLabel>
                                <FormDescription>Required dimensions: 1600x200px</FormDescription>
                                <FormControl>
                                   <div className="w-full">
                                        <Input id={`banner-upload-${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, imageField.onChange, { width: 1600, height: 200 })} />
                                        {imageField.value ? (
                                            <div className="relative w-full aspect-[8/1] border-2 border-dashed rounded-lg p-2">
                                                <Image src={imageField.value} alt="Banner preview" fill objectFit="cover" />
                                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => imageField.onChange('')}><X className="h-4 w-4" /></Button>
                                            </div>
                                        ) : (
                                            <label htmlFor={`banner-upload-${index}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name={`heroBanners.${index}.imageHint`} render={({ field }) => ( <FormItem><FormLabel>Image Hint (for AI)</FormLabel><FormControl><Input placeholder="e.g. 'fashion model'" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendBanner({ title: '', description: '', imageUrl: '', imageHint: '' })}>Add Banner</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Promotional Banner</CardTitle>
                <CardDescription>A large banner to highlight a special campaign or collection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={form.control} name="promoBanner.title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="promoBanner.description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="promoBanner.imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormDescription>Required dimensions: 1200x600px</FormDescription>
                         <FormControl>
                           <div className="w-full">
                                <Input id="promo-banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, field.onChange, { width: 1200, height: 600 })} />
                                {field.value ? (
                                    <div className="relative w-full aspect-[2/1] border-2 border-dashed rounded-lg p-2">
                                        <Image src={field.value} alt="Promo banner preview" fill objectFit="cover" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => field.onChange('')}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <label htmlFor="promo-banner-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="promoBanner.imageHint" render={({ field }) => ( <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g. 'summer collection'" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="promoBanner.buttonText" render={({ field }) => ( <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="promoBanner.buttonLink" render={({ field }) => ( <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Enter the URLs for your main brand's social media profiles.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="socials.twitter" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Twitter/> Twitter</FormLabel><FormControl><Input placeholder="https://twitter.com/yourbrand" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="socials.facebook" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Facebook/> Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/yourbrand" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="socials.instagram" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Instagram/> Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/yourbrand" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="socials.linkedin" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Linkedin/> LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/company/yourbrand" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <CardTitle>Featured Categories</CardTitle>
                <CardDescription>Select which categories to display on the main landing page grid.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="featuredCategories"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <div className="flex items-center gap-2">
                                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category to add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories
                                            .filter(cat => !field.value?.includes(cat))
                                            .map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        if (selectedCategory && !field.value?.includes(selectedCategory)) {
                                            appendCategory(selectedCategory);
                                            setSelectedCategory('');
                                        }
                                    }}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {categoryFields.map((field, index) => (
                                    <Badge key={field.id} variant="secondary" className="flex items-center gap-1 capitalize">
                                        {form.getValues('featuredCategories')?.[index]}
                                        <button type="button" onClick={() => removeCategory(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <FormDescription>These categories will be featured on the main homepage.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
      </form>
    </Form>
  );
}
