
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrandForm } from '@/components/admin/brand-form';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '@/components/ui/loader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const brandName = params.name as string;
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandName) return;

    const fetchBrand = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/brands/${brandName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch brand data');
        }
        const data = await response.json();
        setBrand(data.brand);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [brandName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  if (!brand) {
    return <div className="text-center text-muted-foreground">Brand not found.</div>;
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-bold">Edit Brand</h1>
        </div>
        <Card>
        <CardHeader>
            <CardTitle>Update Brand</CardTitle>
            <CardDescription>
            Update the details for <strong>{brand.displayName}</strong>. The permanent name cannot be changed.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <BrandForm mode="edit" existingBrand={brand} />
        </CardContent>
        </Card>
    </div>
  );
}
