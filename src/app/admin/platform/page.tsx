
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, UploadCloud, X, Home, Save } from 'lucide-react';
import type { IPlatformSettings } from '@/models/platform.model';
import { PlatformSettingsValidationSchema, type PlatformSettingsValues } from '@/lib/brand-schema';
import { Loader } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function PlatformSettingsPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState('');
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<PlatformSettingsValues>({
    resolver: zodResolver(PlatformSettingsValidationSchema),
    defaultValues: {
        heroBanners: [],
        featuredCategories: [],
    },
    mode: 'onChange',
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/platform');
            if (response.ok) {
                const settings = await response.json();
                if (settings) {
                    form.reset({
                        ...settings,
                        featuredCategories: settings.featuredCategories.map((cat: string) => ({name: cat})),
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch platform settings", error);
            toast.error("Could not load platform settings.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchSettings();
  }, [form]);

  const { fields: bannerFields, append: appendBanner, remove: removeBanner } = useFieldArray({
    control: form.control,
    name: 'heroBanners',
  });
  
  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: 'featuredCategories',
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
      form.reset(data); // Re-set form with the saved data to clear dirty state

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
            <CardContent><Loader /></CardContent>
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
                    <CardDescription>Manage the content and appearance of the main public-facing landing page.</CardDescription>
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
                <CardTitle>Homepage Hero Banners</CardTitle>
                <CardDescription>Manage the carousel banners on the main landing page. Recommended size: 1600x400px.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {bannerFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeBanner(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                        <FormField
                            control={form.control}
                            name={`heroBanners.${index}.title`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`heroBanners.${index}.description`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`heroBanners.${index}.imageUrl`}
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
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
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
                            name={`heroBanners.${index}.imageHint`}
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
