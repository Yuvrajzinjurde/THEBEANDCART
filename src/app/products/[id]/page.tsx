

"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import ProductDetails from '@/components/product-details';
import { Loader } from '@/components/ui/loader';

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [variants, setVariants] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProductAndVariants() {
      try {
        setLoading(true);
        // Fetch main product data
        const productResponse = await fetch(`/api/products/${id}`);
        if (!productResponse.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await productResponse.json();
        const mainProduct: IProduct = data.product;
        setProduct(mainProduct);

        // If the product has a styleId, fetch its variants
        if (mainProduct.styleId) {
          const variantsResponse = await fetch(`/api/products/variants/${mainProduct.styleId}`);
          if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json();
            setVariants(variantsData.variants);
          }
        }

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

    fetchProductAndVariants();
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
  
  const storefront = searchParams.get('storefront') || product.storefront;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetails product={product} variants={variants.length > 0 ? variants : [product]} storefront={storefront} />
    </div>
  );
}
