

"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { IBrand, ICategoryGridItem } from '@/models/brand.model';
import type { IProduct } from '@/models/product.model';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader } from '@/components/ui/loader';
import { BrandProductCard } from '@/components/brand-product-card';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Autoplay from 'embla-carousel-autoplay';
import { Skeleton } from '@/components/ui/skeleton';


const CategoryGrid = ({ brand }: { brand: IBrand }) => {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = useMemo(() => {
        if (!brand.categoryGrid || brand.categoryGrid.length === 0) return [];
        const uniqueCatsFromData = new Set(brand.categoryGrid.map(item => item.category));
        uniqueCatsFromData.delete('All');
        return ['All', ...Array.from(uniqueCatsFromData)];
    }, [brand.categoryGrid]);

    const activeContent = useMemo(() => {
        return brand.categoryGrid.find(item => item.category === activeCategory) || brand.categoryGrid.find(item => item.category === 'All');
    }, [activeCategory, brand.categoryGrid]);
    
    const surroundingImages = useMemo(() => {
        const categoryData = brand.categoryGrid.find(item => item.category === activeCategory) || brand.categoryGrid.find(item => item.category === 'All');
        return categoryData?.images.slice(0, 8) || [];
    }, [brand.categoryGrid, activeCategory]);

    if (!activeContent || surroundingImages.length < 8) {
        return null;
    }
    
    return (
        <section className="container py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center flex-wrap gap-3 mb-8">
                {categories.map(category => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? 'default' : 'outline'}
                        onClick={() => setActiveCategory(category)}
                        className="rounded-full px-6"
                    >
                        {category}
                    </Button>
                ))}
            </div>
            
            <div className="grid grid-cols-3 grid-rows-4 gap-4 max-w-3xl mx-auto">
                {/* Row 1 */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg group row-span-2">
                    <Image src={surroundingImages[0].url} alt={surroundingImages[0].hint || 'Grid image 1'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[0].hint} />
                </div>
                <div className="relative aspect-[4/2.5] rounded-xl overflow-hidden shadow-lg group">
                     <Image src={surroundingImages[1].url} alt={surroundingImages[1].hint || 'Grid image 2'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[1].hint} />
                </div>
                <div className="relative aspect-[4/2.5] rounded-xl overflow-hidden shadow-lg group">
                     <Image src={surroundingImages[2].url} alt={surroundingImages[2].hint || 'Grid image 3'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[2].hint} />
                </div>

                {/* Row 2 - Center piece is here */}
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-primary text-primary-foreground p-6 flex flex-col items-center justify-center text-center row-span-2">
                    <h3 className="text-2xl font-bold">{activeContent.title}</h3>
                    <p className="mt-2 mb-4 text-base opacity-90">{activeContent.description}</p>
                    <Button variant="secondary" size="lg" className="bg-background text-primary hover:bg-background/90 shadow-md" asChild>
                        <Link href={activeContent.buttonLink || '#'}>View More</Link>
                    </Button>
                </div>
                 <div className="relative aspect-[4/2.5] rounded-xl overflow-hidden shadow-lg group">
                     <Image src={surroundingImages[3].url} alt={surroundingImages[3].hint || 'Grid image 4'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[3].hint} />
                </div>

                {/* Row 3 */}
                <div className="relative aspect-[4/2.5] rounded-xl overflow-hidden shadow-lg group">
                    <Image src={surroundingImages[4].url} alt={surroundingImages[4].hint || 'Grid image 5'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[4].hint} />
                </div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg group row-span-2">
                     <Image src={surroundingImages[5].url} alt={surroundingImages[5].hint || 'Grid image 6'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[5].hint} />
                </div>
                
                {/* Row 4 */}
                <div className="relative aspect-[4/2.5] rounded-xl overflow-hidden shadow-lg group">
                     <Image src={surroundingImages[6].url} alt={surroundingImages[6].hint || 'Grid image 7'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[6].hint} />
                </div>
                <div className="relative aspect-[4/2.5] rounded-xl overflow-hidden shadow-lg group">
                     <Image src={surroundingImages[7].url} alt={surroundingImages[7].hint || 'Grid image 8'} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" data-ai-hint={surroundingImages[7].hint} />
                </div>
            </div>
        </section>
    );
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


const PromoBannerSection = ({ brand, brandName }: { brand: IBrand | null, brandName: string }) => {
    if (!brand?.promoBanner) return null;
    const { imageUrl, imageHint, buttonLink } = brand.promoBanner;
    return (
        <section className="container py-12 px-4 sm:px-6 lg:px-8">
            <Link href={buttonLink || `/${brandName}/products`}>
                <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video md:aspect-[4/1]">
                    <Image
                        src={imageUrl || ''}
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

interface IReview {
  customerName: string;
  rating: number;
  reviewText: string;
  customerAvatarUrl: string;
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
                    <CardContent className="p-0">
                      <div className="flex justify-center text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-5 h-5", i < review.rating ? 'fill-current' : 'text-muted-foreground/30')} />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">&quot;{review.reviewText}&quot;</p>
                    </CardContent>
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
  
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
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
             const [brandResponse, productsResponse, trendingResponse, topRatedResponse, newestResponse] = await Promise.all([
                fetch(`/api/brands/${brandName}`),
                fetch(`/api/products?storefront=${brandName}&limit=50`),
                fetch(`/api/products?storefront=${brandName}&sortBy=popular&limit=12`),
                fetch(`/api/products?storefront=${brandName}&sortBy=rating&limit=12`),
                fetch(`/api/products?storefront=${brandName}&sortBy=newest&limit=12`)
            ]);

            if (!brandResponse.ok) {
              const errorData = await brandResponse.json();
              throw new Error(errorData.message || 'Brand not found');
            }
            const brandData = await brandResponse.json();
            setBrand(brandData.brand);

            if (productsResponse.ok) {
                const { products } = await productsResponse.json();
                setAllProducts(products);
            }

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
                                    alt={banner.title || 'Promotional banner'}
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
      
      <CategoryGrid brand={brand} />
      
      <ProductCarouselSection title="Trending Products" products={trendingProducts} brandName={brandName} />
      <ProductCarouselSection title="Top Rated" products={topRatedProducts} brandName={brandName} />
      <ProductCarouselSection title="Newest Arrivals" products={newestProducts} brandName={brandName} />

      <PromoBannerSection brand={brand} brandName={brandName} />
      <ReviewsSection brand={brand} />

    </main>
  );
}
    

    

