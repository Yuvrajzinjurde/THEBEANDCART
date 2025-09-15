
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import ProductDetails from '@/components/product-details';
import { Loader } from '@/components/ui/loader';

export default function ProductPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProductAndTrackView() {
      try {
        // Fetch product data
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data.product);

        // Track the view - fire and forget
        fetch(`/api/products/${id}/track`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metric: 'views' }),
        }).catch(err => console.error("Failed to track view:", err));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndTrackView();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive"><p>{error}</p></div>;
  }
  
  if (!product) {
    return <div className="text-center text-muted-foreground"><p>Product not found.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetails product={product} />
    </div>
  );
}
