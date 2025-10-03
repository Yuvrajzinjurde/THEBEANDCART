

"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import type { IBrand } from '@/models/brand.model';
import type { ICoupon } from '@/models/coupon.model';
import ProductDetails from '@/components/product-details';
import { Loader } from '@/components/ui/loader';
import useRecentlyViewedStore from '@/stores/recently-viewed-store';
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
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
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
            <div className="container pt-12 px-4 sm:px-6 lg:px-8 text-center">
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
        <section className="container pt-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <Separator className="my-4" />
            <Carousel
                opts={{
                    align: "start",
                    loop: products.length > 2,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 sm:-ml-4">
                    {products.map((product) => (
                        <CarouselItem key={product._id as string} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
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


const BrandFooter = ({ brand }: { brand: IBrand | null }) => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container py-8 px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {brand?.logoUrl && (
                        <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={32} height={32} className="h-8 w-8 object-cover rounded-full" />
                    )}
                    <span className="text-lg font-bold capitalize">{brand?.displayName}</span>
                </div>
                 <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                    <Link href={`/${brand?.permanentName}/legal/about-us`} className="hover:text-primary">About Us</Link>
                    <Link href={`/${brand?.permanentName}/legal/privacy-policy`} className="hover:text-primary">Policies</Link>
                    <Link href={`/${brand?.permanentName}/legal/contact-us`} className="hover:text-primary">Contact Us</Link>
                </div>
                 <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
            <div className="mt-8 border-t pt-4">
                <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {brand?.displayName}. All rights reserved.</p>
            </div>
        </div>
    </footer>
);


export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [variants, setVariants] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ totalRatings: 0, totalReviews: 0, averageRating: 0 });
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);

  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  const [boughtTogether, setBoughtTogether] = useState<IProduct[]>([]);

  const { recentlyViewed, addProduct } = useRecentlyViewedStore();

  useEffect(() => {
    if (!id) return;

    async function fetchProductAndVariants() {
      try {
        setLoading(true);
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
        addProduct(mainProduct); 

        if(reviewStatsResponse.ok) {
            const stats = await reviewStatsResponse.json();
            setReviewStats(stats);
        }
        
        if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData.reviews);
        }

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

        if (mainProduct.styleId) {
          const variantsResponse = await fetch(`/api/products/variants/${mainProduct.styleId}`);
          if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json();
            setVariants(variantsData.variants);
          }
        }
        
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
    return <ProductPageSkeleton />;
  }

  if (error) {
    return <div className="text-center text-destructive py-10"><p>{error}</p></div>;
  }
  
  if (!product) {
    return <div className="text-center text-muted-foreground py-10"><p>Product not found.</p></div>;
  }
  
  const storefront = searchParams.get('storefront') || product.storefront;
  const filteredRecentlyViewed = recentlyViewed.filter(p => p._id !== product._id);

  return (
    <>
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        <ProductDetails 
          product={product} 
          variants={variants.length > 0 ? variants : [product]} 
          storefront={storefront} 
          reviewStats={reviewStats}
          reviews={reviews}
          coupons={coupons}
        >
           <BoughtTogetherSection products={boughtTogether} />
        </ProductDetails>
        
        <div className="mt-16">
          <ProductCarouselSection title="Similar Products" products={similarProducts} isLoading={loadingSimilar} />
          <ProductCarouselSection title="Recently Viewed" products={filteredRecentlyViewed} />
        </div>
      </main>
      <BrandFooter brand={brand} />
    </>
  );
}
