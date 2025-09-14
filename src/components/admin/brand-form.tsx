
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
import { Trash, UploadCloud, X } from 'lucide-react';
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

interface BrandFormProps {
  mode: 'create' | 'edit';
  existingBrand?: IBrand;
}

export function BrandForm({ mode, existingBrand }: BrandFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues = existingBrand ? {
    displayName: existingBrand.displayName,
    permanentName: existingBrand.permanentName,
    logoUrl: existingBrand.logoUrl,
    banners: existingBrand.banners,
    themeName: existingBrand.themeName,
  } : {
    displayName: '',
    permanentName: '',
    logoUrl: '',
    banners: [{ title: '', description: '', imageUrl: '', imageHint: '' }],
    themeName: undefined, // Default to no theme selected
  };

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandFormSchema),
    defaultValues,
    mode: 'onChange', // Validate on change
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'banners',
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
      router.push('/admin/dashboard');
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
                <CardTitle>Banners</CardTitle>
                <CardDescription>Add at least one banner for the homepage. Recommended size: 1600x400px.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {fields.map((field, index) => (
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
                                    <AlertDialogAction onClick={() => remove(index)}>Continue</AlertDialogAction>
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
                <Button type="button" variant="outline" onClick={() => append({ title: '', description: '', imageUrl: '', imageHint: '' })}>Add Banner</Button>
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
