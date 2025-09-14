
"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '../ui/loader';
import { Textarea } from '../ui/textarea';

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageHint: z.string().min(1, "Image hint is required"),
});

export const BrandFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  permanentName: z.string().min(1, "Permanent name is required").regex(/^[a-z0-9-]+$/, "Permanent name can only contain lowercase letters, numbers, and hyphens."),
  logoUrl: z.string().url("Must be a valid URL"),
  banners: z.array(bannerSchema).min(1, "At least one banner is required"),
  theme: z.object({
    primary: z.string().regex(/^([0-9]{1,3}(\.[0-9]+)?\s){2}[0-9]{1,3}(\.[0-9]+)?%$/, "Invalid HSL format. Example: 217.2 91.2% 59.8%"),
    background: z.string().regex(/^([0-9]{1,3}(\.[0-9]+)?\s){2}[0-9]{1,3}(\.[0-9]+)?%$/, "Invalid HSL format. Example: 0 0% 100%"),
    accent: z.string().regex(/^([0-9]{1,3}(\.[0-9]+)?\s){2}[0-9]{1,3}(\.[0-9]+)?%$/, "Invalid HSL format. Example: 210 40% 96.1%"),
  }),
});

type BrandFormValues = z.infer<typeof BrandFormSchema>;

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
    theme: {
        primary: existingBrand.theme.primary,
        background: existingBrand.theme.background,
        accent: existingBrand.theme.accent,
    },
  } : {
    displayName: '',
    permanentName: '',
    logoUrl: '',
    banners: [{ title: '', description: '', imageUrl: '', imageHint: '' }],
    theme: { primary: '217.2 91.2% 59.8%', background: '0 0% 100%', accent: '210 40% 96.1%' },
  };

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'banners',
  });

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
          <CardContent className="space-y-4">
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
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Banners</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
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
                            render={({ field }) => (
                                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`banners.${index}.imageHint`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Image Hint (for AI)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ title: '', description: '', imageUrl: '', imageHint: '' })}>Add Banner</Button>
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField
                control={form.control}
                name="theme.primary"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Primary Color (HSL)</FormLabel>
                    <FormControl><Input placeholder="217.2 91.2% 59.8%" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="theme.background"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Background Color (HSL)</FormLabel>
                    <FormControl><Input placeholder="0 0% 100%" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="theme.accent"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Accent Color (HSL)</FormLabel>
                    <FormControl><Input placeholder="210 40% 96.1%" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
          {mode === 'create' ? 'Create Brand' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
