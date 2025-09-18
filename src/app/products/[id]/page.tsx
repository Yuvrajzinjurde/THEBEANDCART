

"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import ProductDetails from '@/components/product-details';
import { Loader } from '@/components/ui/loader';
import useRecentlyViewedStore from '@/stores/recently-viewed-store';
import { BrandProductCard } from '@/components/brand-product-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';

const ProductCarouselSection = ({ title, products, isLoading }: { title: string, products: IProduct[], isLoading?: boolean }) => {
    if (isLoading) {
        return (
            <div className="pt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
                <div className="w-full flex justify-center">
                    <Loader />
                </div>
            </div>
        )
    }

    if (!products || products.length === 0) return null;
    return (
        <section className="pt-12">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <Separator className="my-4" />
            <Carousel
                opts={{
                    align: "start",
                    loop: products.length > 5,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {products.map((product) => (
                        <CarouselItem key={product._id as string} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                            <div className="p-1">
                                <BrandProductCard product={product} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
    );
};


export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [variants, setVariants] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const { recentlyViewed, addProduct } = useRecentlyViewedStore();

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
        addProduct(mainProduct); // Add to recently viewed

        // If the product has a styleId, fetch its variants
        if (mainProduct.styleId) {
          const variantsResponse = await fetch(`/api/products/variants/${mainProduct.styleId}`);
          if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json();
            setVariants(variantsData.variants);
          }
        }
        
        // Fetch similar products
        if (mainProduct.keywords && mainProduct.keywords.length > 0) {
            setLoadingSimilar(true);
            const keywordsQuery = mainProduct.keywords.join(',');
            const similarResponse = await fetch(`/api/products?keywords=${keywordsQuery}&storefront=${mainProduct.storefront}&exclude=${mainProduct._id}`);
            if (similarResponse.ok) {
                const { products: similar } = await similarResponse.json();
                setSimilarProducts(similar);
            }
            setLoadingSimilar(false);
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
  }, [id, addProduct]);

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
  const filteredRecentlyViewed = recentlyViewed.filter(p => p._id !== product._id);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetails product={product} variants={variants.length > 0 ? variants : [product]} storefront={storefront} />
      
       <div className="mt-16">
        <ProductCarouselSection title="Similar Products" products={similarProducts} isLoading={loadingSimilar} />
        <ProductCarouselSection title="Recently Viewed" products={filteredRecentlyViewed} />
      </div>
    </div>
  );
}
