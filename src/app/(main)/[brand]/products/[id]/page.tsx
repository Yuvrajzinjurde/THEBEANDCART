
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import type { IBrand } from '@/models/brand.model';
import type { ICoupon } from '@/models/coupon.model';
import ProductDetails from '@/components/product-details';
import { Loader } from '@/components/ui/loader';
import { BrandProductCard } from '@/components/brand-product-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import type { ReviewStats } from '@/app/api/reviews/[productId]/stats/route';
import type { IReview } from '@/models/review.model';
import { Skeleton } from '@/components/ui/skeleton';

const ProductPageSkeleton = () => (
    <div className="container mx-auto py-8 px-4 text-center">
        <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="grid grid-cols-6 gap-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-md" />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Separator />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
        <div className="mx-auto text-center">
          <p className="my-8 text-lg text-muted-foreground">Just a moment, getting everything ready for you…</p>
        </div>
    </div>
);


const ProductCarouselSection = ({ title, products, isLoading }: { title: string, products: IProduct[], isLoading?: boolean }) => {
    if (isLoading) {
        return (
            <div className="container pt-12 px-4">
                <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
                <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 flex-shrink-0 p-1">
                            <div className="space-y-2">
                                <Skeleton className="aspect-square w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mx-auto text-center">
                   <p className="my-8 text-lg text-muted-foreground">Just a moment, getting everything ready for you…</p>
                 </div>
            </div>
        )
    }

    if (!products || products.length === 0) return null;
    return (
        <section className="container pt-12 px-4">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <Separator className="my-4" />
            <Carousel
                opts={{
                    align: "start",
                    loop: products.length > 6,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {products.map((product) => (
                        <CarouselItem key={product._id as string} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                            <div className="p-1">
                                <BrandProductCard product={product} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
    );
};

const BoughtTogetherSection = ({ products }: { products: IProduct[] }) => {
  if (products.length < 2) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Frequently Bought Together</h3>
      <div className="flex items-center gap-4 rounded-lg overflow-x-auto no-scrollbar">
        {products.map((p, index) => (
          <React.Fragment key={p._id as string}>
            <div className="w-32 flex-shrink-0">
              <BrandProductCard product={p} />
            </div>
            {index < products.length - 1 && <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};


export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id, brand: brandName } = params;
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ totalRatings: 0, totalReviews: 0, averageRating: 0 });
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);

  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  const [boughtTogether, setBoughtTogether] = useState<IProduct[]>([]);

  useEffect(() => {
    if (!id) return;

    async function fetchProductAndVariants() {
      try {
        setLoading(true);
        // Fetch main product data and review stats in parallel
        const [productResponse, reviewStatsResponse, reviewsResponse] = await Promise.all([
            fetch(`/api/products/${id}`),
            fetch(`/api/reviews/${id}/stats`),
            fetch(`/api/reviews/${id}`)
        ]);

        if (!productResponse.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await productResponse.json();
        const mainProduct: IProduct = data.product;
        setProduct(mainProduct);

        if(reviewStatsResponse.ok) {
            const stats = await reviewStatsResponse.json();
            setReviewStats(stats);
        }
        
        if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData.reviews);
        }

        // Fetch brand data and coupons in parallel
        if (mainProduct.storefront) {
          const [brandResponse, couponResponse] = await Promise.all([
            fetch(`/api/brands/${mainProduct.storefront}`),
            fetch(`/api/coupons?brand=${mainProduct.storefront}`)
          ]);

          if (brandResponse.ok) {
            const brandData = await brandResponse.json();
            setBrand(brandData.brand);
          }
          if (couponResponse.ok) {
              const couponData = await couponResponse.json();
              setCoupons(couponData.coupons);
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
                if (similar.length > 1) {
                  setBoughtTogether([mainProduct, similar[0]]);
                }
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
  }, [id]);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive py-10"><p>{error}</p></div>;
  }
  
  if (!product) {
    return <div className="text-center text-muted-foreground py-10"><p>Product not found.</p></div>;
  }
  
  const storefront = (brandName as string) || product.storefront;

  return (
      <main className="container py-8 px-4">
        <ProductDetails 
          product={product} 
          storefront={storefront} 
          reviewStats={reviewStats}
          reviews={reviews}
          coupons={coupons}
        >
           <BoughtTogetherSection products={boughtTogether} />
        </ProductDetails>
        
        <div className="mt-16">
          <ProductCarouselSection title="Similar Products" products={similarProducts} isLoading={loadingSimilar} />
        </div>
      </main>
  );
}
