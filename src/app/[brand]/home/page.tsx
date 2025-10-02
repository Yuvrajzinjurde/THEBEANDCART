

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { IBrand, IReview } from '@/models/brand.model';
import type { IProduct } from '@/models/product.model';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Loader } from '@/components/ui/loader';
import { BrandProductCard } from '@/components/brand-product-card';
import { Twitter, Facebook, Instagram, Linkedin, ArrowRight, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Autoplay from 'embla-carousel-autoplay';
import { Skeleton } from '@/components/ui/skeleton';


type GroupedProducts = {
  [category: string]: IProduct[];
};

const ProductCarouselSkeleton = () => (
    <section className="container pt-12 px-4 sm:px-6 lg:px-8 text-center">
        <Skeleton className="h-8 w-48 mb-4 mx-auto" />
        <Separator className="mb-6" />
        <div className="mx-auto text-center">
          <p className="my-8 text-lg text-muted-foreground col-span-full">Just a moment, getting everything ready for you…</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                     <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Skeleton className="w-full sm:w-36 h-36 rounded-lg flex-shrink-0" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-8 w-1/2 mt-2" />
                            <div className="flex items-center gap-2 mt-4 pt-4 sm:pt-0 sm:mt-auto">
                                <Skeleton className="h-10 w-36" />
                                <Skeleton className="h-10 w-28" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </section>
);


const ProductCarouselSection = ({ title, products, brandName }: { title: string, products: IProduct[], brandName: string }) => {
    if (!products || products.length === 0) return null;
    
    return (
        <section className="container pt-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
                 <Button variant="link" asChild>
                    <Link href={`/${brandName}/products`}>
                        Discover All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Separator className="mb-6" />
             <Carousel
                opts={{
                    align: "start",
                    loop: products.length > 2,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2">
                    {products.map((product) => (
                        <CarouselItem key={product._id as string} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                            <BrandProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
    );
};


const CategoryCarousel = ({ brand }: { brand: IBrand | null }) => {
    if (!brand || !brand.categoryBanners || brand.categoryBanners.length === 0) {
        return null;
    }

    const banners = brand.categoryBanners;

    return (
        <section className="py-8 md:hidden">
             <div className="container px-4 sm:px-6">
                <h2 className="text-lg font-semibold tracking-tight mb-4">Shop by Category</h2>
                <Carousel opts={{ align: "start", dragFree: true }} className="w-full no-scrollbar">
                    <CarouselContent className="-ml-4">
                        {banners.map((banner, index) => (
                             <CarouselItem key={index} className="basis-1/3 pl-4">
                                <Link href={`/${brand.permanentName}/products?category=${encodeURIComponent(banner.categoryName)}`} className="flex flex-col items-center gap-2 group">
                                    <div className="w-24 h-24 relative overflow-hidden border-2 border-transparent group-hover:border-primary transition-all rounded-full">
                                        <Image
                                            src={banner.imageUrl}
                                            alt={banner.categoryName}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={banner.imageHint}
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-center truncate w-20">{banner.categoryName}</p>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};

const CategoryBannerGrid = ({ brand }: { brand: IBrand | null }) => {
    if (!brand || !brand.categoryBanners || brand.categoryBanners.length === 0) {
        return null;
    }

    const banners = brand.categoryBanners;

    // This defines the structure of the grid. 
    // You can adjust which banner goes into which column index here.
    const columns = [
        [banners[0], banners[1]], // Column 1
        [banners[2], banners[3], banners[4]], // Column 2
        [banners[5], banners[6]], // Column 3
        [banners[7], banners[8]], // Column 4
    ].map(col => col.filter(Boolean)); // Filter out undefined if banners array is shorter

    return (
        <section id="categories" className="w-full py-12 sm:py-20 px-4 sm:px-8 hidden md:block">
            <div className="container p-4 md:p-8 rounded-2xl">
                 <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                        {columns.map((columnItems, colIndex) => (
                            <div key={colIndex} className="grid gap-4">
                                {columnItems.map((banner, itemIndex) => (
                                    <Link 
                                        key={itemIndex} 
                                        href={`/${brand.permanentName}/products?category=${encodeURIComponent(banner.categoryName)}`}
                                        className="relative group overflow-hidden rounded-xl shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl"
                                    >
                                        <Image 
                                            src={banner.imageUrl}
                                            alt={banner.categoryName}
                                            width={400}
                                            height={colIndex === 1 && itemIndex === 0 ? 600 : 400} // Example of different height
                                            data-ai-hint={banner.imageHint}
                                            className={cn(
                                                "object-cover w-full transition-transform duration-300 group-hover:scale-105",
                                                colIndex === 1 && itemIndex === 0 ? "aspect-[2/3]" : "aspect-square"
                                            )}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <h3 className="text-white text-lg font-bold">{banner.categoryName}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const PromoBannerSection = ({ brand, brandName }: { brand: IBrand | null, brandName: string }) => {
    if (!brand?.promoBanner) return null;
    const { imageUrl, imageHint, buttonLink } = brand.promoBanner;
    return (
        <section className="container py-12 px-4 sm:px-6 lg:px-8">
            <Link href={buttonLink || `/${brandName}/products`}>
                <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video md:aspect-[4/1]">
                    <Image
                        src={imageUrl}
                        alt={'Promotional banner'}
                        fill
                        className="object-cover"
                        data-ai-hint={imageHint}
                    />
                </div>
            </Link>
        </section>
    )
}

const ReviewsSection = ({ brand }: { brand: IBrand | null }) => {
  const [shuffledReviews, setShuffledReviews] = useState<IReview[]>([]);

  useEffect(() => {
    if (brand?.reviews && brand.reviews.length > 0) {
      const shuffled = [...brand.reviews].sort(() => Math.random() - 0.5);
      setShuffledReviews(shuffled);
    }
  }, [brand?.reviews]);

  if (!brand?.reviews || brand.reviews.length === 0) return null;
  
  const reviewsToDisplay = shuffledReviews.length > 0 ? shuffledReviews : brand.reviews;


  return (
    <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Your Cheers, Our Motivation</h2>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {reviewsToDisplay.map((review, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="p-6 text-center h-full flex flex-col justify-between shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div>
                      <div className="flex justify-center text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-5 h-5", i < review.rating ? 'fill-current' : 'text-muted-foreground/30')} />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">&quot;{review.reviewText}&quot;</p>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.customerAvatarUrl} />
                        <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{review.customerName}</p>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
          <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};


export default function BrandHomePage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const brandName = params.brand as string;

  const [brand, setBrand] = useState<IBrand | null>(null);
  
  const [trendingProducts, setTrendingProducts] = useState<IProduct[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<IProduct[]>([]);
  const [newestProducts, setNewestProducts] = useState<IProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mainCarouselPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    async function fetchBrandAndProducts() {
        if (!brandName) return;
        setLoading(true);
        setError(null);
        try {
            const brandResponse = await fetch(`/api/brands/${brandName}`);
            if (!brandResponse.ok) {
              const errorData = await brandResponse.json();
              throw new Error(errorData.message || 'Brand not found');
            }
            const brandData = await brandResponse.json();
            setBrand(brandData.brand);

            const [trendingResponse, topRatedResponse, newestResponse] = await Promise.all([
                fetch(`/api/products?storefront=${brandName}&sortBy=popular&limit=12`),
                fetch(`/api/products?storefront=${brandName}&sortBy=rating&limit=12`),
                fetch(`/api/products?storefront=${brandName}&sortBy=newest&limit=12`)
            ]);

            if (trendingResponse.ok) {
                const { products } = await trendingResponse.json();
                setTrendingProducts(products);
            }
             if (topRatedResponse.ok) {
                const { products } = await topRatedResponse.json();
                setTopRatedProducts(products);
            }
            if (newestResponse.ok) {
                const { products } = await newestResponse.json();
                setNewestProducts(products);
            }

        } catch (error: any) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    fetchBrandAndProducts();
  }, [brandName]);

  if (authLoading || loading) {
    return (
        <main>
            <Skeleton className="w-full h-[90px] md:h-[90px]" />
            <ProductCarouselSkeleton />
            <ProductCarouselSkeleton />
            <ProductCarouselSkeleton />
        </main>
    );
  }
  
  if (error || !brand) {
      return (
          <main className="container flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold">Brand not found</h1>
              <p className="text-muted-foreground">{error || 'The requested brand does not exist.'}</p>
          </main>
      )
  }
  
  return (
    <main>
        <section className="w-full">
            <Carousel 
                className="w-full"
                plugins={[mainCarouselPlugin.current]}
                onMouseEnter={() => mainCarouselPlugin.current.stop()}
                onMouseLeave={() => mainCarouselPlugin.current.reset()}
            >
                <CarouselContent>
                {brand.banners.map((banner, index) => (
                    <CarouselItem key={index}>
                        <Link href={banner.buttonLink || `/${brandName}/products`}>
                            <div className="relative w-full text-foreground py-24 sm:py-32 md:py-40 flex items-center justify-center">
                                <Image
                                    src={banner.imageUrl}
                                    alt={'Promotional banner'}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={banner.imageHint}
                                    priority={index === 0}
                                />
                            </div>
                        </Link>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
      
      <CategoryCarousel brand={brand} />
      
      <ProductCarouselSection title="Trending Products" products={trendingProducts} brandName={brandName} />
      <ProductCarouselSection title="Top Rated" products={topRatedProducts} brandName={brandName} />
      <ProductCarouselSection title="Newest Arrivals" products={newestProducts} brandName={brandName} />
      
      <CategoryBannerGrid brand={brand} />

      <PromoBannerSection brand={brand} brandName={brandName} />
      <ReviewsSection brand={brand} />

    </main>
  );
}
