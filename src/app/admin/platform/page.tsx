

"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, UploadCloud, X, Home, Save, Bot, Gift, Sparkles, Twitter, Facebook, Instagram, Linkedin, Palette, Tv } from 'lucide-react';
import { PlatformSettingsValidationSchema, type PlatformSettingsValues, themeColors } from '@/lib/brand-schema';
import { Loader } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import usePlatformSettingsStore from '@/stores/platform-settings-store';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const staticDefaultValues: PlatformSettingsValues = {
  platformName: 'The Brand Cart',
  platformLogoUrl: '',
  platformFaviconUrl: '',
  platformThemeName: 'Blue',
  socials: { twitter: '', facebook: '', instagram: '', linkedin: '' },
  aiEnabled: true,
  hamperFeatureEnabled: true,
  offersFeatureEnabled: true,
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
  offers: [
    {
      title: "First-Time Shopper",
      description: "Get a flat 25% off on your very first order with us.",
      code: "WELCOME25",
    },
  ]
};


export default function PlatformSettingsPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const { settings, fetchSettings } = usePlatformSettingsStore();

  const form = useForm<PlatformSettingsValues>({
    resolver: zodResolver(PlatformSettingsValidationSchema),
    defaultValues: staticDefaultValues,
    mode: 'onChange',
  });
  
  useEffect(() => {
    const fetchAndSetSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/platform');
            if (response.ok) {
                const settingsData = await response.json();
                if (settingsData) {
                    // Ensure all fields have a default value to avoid uncontrolled inputs
                    const defaultSocials = { twitter: '', facebook: '', instagram: '', linkedin: '' };
                    const defaultPromoBanner = { title: '', description: '', imageUrl: '', imageHint: '', buttonText: '', buttonLink: '' };

                    const sanitizedSettings: PlatformSettingsValues = {
                        ...staticDefaultValues, // Start with static defaults
                        ...settingsData, // Overwrite with fetched data
                        platformName: settingsData.platformName || '',
                        platformLogoUrl: settingsData.platformLogoUrl || '',
                        platformFaviconUrl: settingsData.platformFaviconUrl || '',
                        platformThemeName: settingsData.platformThemeName || 'Blue',
                        socials: { ...defaultSocials, ...(settingsData.socials || {}) },
                        featuredCategories: (settingsData.featuredCategories || []).map((cat: string) => ({ name: cat })),
                        heroBanners: settingsData.heroBanners && settingsData.heroBanners.length > 0 ? settingsData.heroBanners : staticDefaultValues.heroBanners,
                        offers: settingsData.offers && settingsData.offers.length > 0 ? settingsData.offers : staticDefaultValues.offers,
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
            console.error("Failed to fetch platform settings", error);
            toast.error("Could not load platform settings. Displaying default values.");
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

  const { fields: offerFields, append: appendOffer, remove: removeOffer } = useFieldArray({
    control: form.control,
    name: 'offers',
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
  
  const handleCategoryKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newCategory = categoryInput.trim();
      if (newCategory && !(form.getValues('featuredCategories') || []).some(cat => cat.name === newCategory)) {
        appendCategory({ name: newCategory });
        setCategoryInput('');
      }
    }
  };
  
  async function onSubmit(data: PlatformSettingsValues) {
    setIsSubmitting(true);
    const dataToSubmit = {
        ...data,
        featuredCategories: data.featuredCategories?.map(cat => cat.name),
    };

    try {
      const response = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to save settings.`);
      }

      toast.success(`Platform settings saved successfully!`);
      
      // Manually trigger a re-fetch of the global settings store
      await fetchSettings();
      
      const newDefaults = {
          ...result,
          featuredCategories: result.featuredCategories?.map((cat: string) => ({ name: cat })) || [],
          socials: {
              twitter: result.socials?.twitter || '',
              facebook: result.socials?.facebook || '',
              instagram: result.socials?.instagram || '',
              linkedin: result.socials?.linkedin || '',
          },
      };
      form.reset(newDefaults, { keepDirty: false });

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
                name="platformThemeName"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Palette/> Platform Theme</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                            >
                                {themeColors.map((theme) => (
                                <FormItem key={theme.name}>
                                    <FormLabel htmlFor={`theme-${theme.name}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer w-full h-full">
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
              name="offersFeatureEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2"><Bot /> Enable Offers Section</FormLabel>
                    <FormDescription>Show or hide the 'Today's Top Offers' section on the main landing page.</FormDescription>
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
                <CardDescription>Manage the carousel banners on the main landing page.</CardDescription>
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
                                 <FormDescription>Required dimensions: 1600x400px</FormDescription>
                                <FormControl>
                                   <div className="w-full">
                                        <Input id={`banner-upload-${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, imageField.onChange, { width: 1600, height: 400 })} />
                                        {imageField.value ? (
                                            <div className="relative w-full aspect-[4/1] border-2 border-dashed rounded-lg p-2">
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
                <CardTitle>Featured Offers</CardTitle>
                <CardDescription>Add special offers to display on the main landing page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {offerFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeOffer(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <FormField control={form.control} name={`offers.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name={`offers.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name={`offers.${index}.code`} render={({ field }) => ( <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendOffer({ title: '', description: '', code: '' })}>Add Offer</Button>
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
                                                {form.getValues('featuredCategories')?.[index].name}
                                                <button type="button" onClick={() => removeCategory(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </FormControl>
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

    