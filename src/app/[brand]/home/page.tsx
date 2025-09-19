
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
    <section className="container mx-auto px-4 pt-12 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Separator className="mb-6" />
        <div className="flex space-x-4">
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
    </section>
);


const ProductCarouselSection = ({ title, products, brandName }: { title: string, products: IProduct[], brandName: string }) => {
    if (!products || products.length === 0) return null;
    
    const [api, setApi] = useState<CarouselApi>()
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!api || !isHovered) return;

        const interval = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                api.scrollTo(0);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [api, isHovered]);


    return (
        <section className="container mx-auto px-4 pt-12 sm:px-6 lg:px-8">
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
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
                <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
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
        <section id="categories" className="w-full py-12 sm:py-20 px-4 sm:px-8">
            <div className="container mx-auto p-4 md:p-8 rounded-2xl">
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


const OffersSection = ({ brand }: { brand: IBrand | null }) => {
    if (!brand?.offers || brand.offers.length === 0) return null;
    
    const offerIcons = [
        <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
        <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>,
    ];

    return (
        <section className="w-full py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-teal-50/50 to-blue-50/50 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {brand.offers.map((offer, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-blue-200 p-1">
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-blue-500">
                                    {offerIcons[index % offerIcons.length]}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                            <p className="mt-2 text-gray-500">{offer.description}</p>
                             <div className="mt-4">
                                <p className="text-sm text-muted-foreground">Use code:</p>
                                <span className="font-mono text-base font-semibold bg-primary/10 text-primary px-3 py-1 rounded-md">{offer.code}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PromoBannerSection = ({ brand, brandName }: { brand: IBrand | null, brandName: string }) => {
    if (!brand?.promoBanner) return null;
    const { title, description, imageUrl, imageHint, buttonText, buttonLink } = brand.promoBanner;
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
                 <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    data-ai-hint={imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white flex flex-col items-start h-full justify-center">
                    <h2 className="text-3xl md:text-5xl font-bold">{title}</h2>
                    <p className="text-lg text-white/90 mt-4">{description}</p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href={buttonLink}>
                            {buttonText} <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
             <div className="relative rounded-2xl overflow-hidden shadow-xl mt-12 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20">
                <div className="relative z-10 p-8 md:p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background">
                        <Gift className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Create Your Own Hamper</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Design a personalized gift hamper for any occasion. Choose the box, fill it with products, and add a personal touch.
                    </p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href={`/${brandName}/create-hamper`}>
                            Start Creating <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

const ReviewsSection = ({ brand }: { brand: IBrand | null }) => {
  const [shuffledReviews, setShuffledReviews] = useState<IReview[]>([]);

  useEffect(() => {
    if (brand?.reviews && brand.reviews.length > 0) {
      // This will only run on the client, after initial hydration
      const shuffled = [...brand.reviews].sort(() => Math.random() - 0.5);
      setShuffledReviews(shuffled);
    }
  }, [brand?.reviews]);

  if (!brand?.reviews || brand.reviews.length === 0) return null;
  
  const reviewsToDisplay = shuffledReviews.length > 0 ? shuffledReviews : brand.reviews;


  return (
    <section className="w-full py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
    </section>
  );
};


const BrandFooter = ({ brand }: { brand: IBrand | null }) => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

export default function BrandHomePage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const brandName = params.brand as string;

  const [brand, setBrand] = useState<IBrand | null>(null);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  
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
            // Fetch brand data first
            const brandResponse = await fetch(`/api/brands/${brandName}`);
            if (!brandResponse.ok) {
              const errorData = await brandResponse.json();
              throw new Error(errorData.message || 'Brand not found');
            }
            const brandData = await brandResponse.json();
            setBrand(brandData.brand);

            // Then fetch products for that brand
            const productResponse = await fetch(`/api/products?storefront=${brandName}`);
            if(!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }
            const productData = await productResponse.json();
            const fetchedProducts: IProduct[] = productData.products;
            setAllProducts(fetchedProducts);
            
            // --- Sort products for different sections ---
            const productsCopy1 = JSON.parse(JSON.stringify(fetchedProducts));
            const productsCopy2 = JSON.parse(JSON.stringify(fetchedProducts));
            const productsCopy3 = JSON.parse(JSON.stringify(fetchedProducts));

            // 1. Trending Products (by popularity score)
            const calculatePopularity = (p: IProduct) => {
                const views = p.views || 0;
                const clicks = p.clicks || 0;
                const rating = p.rating || 0;
                return (views * 0.2) + (clicks * 0.5) + (rating * 0.3);
            };
            const sortedByPopularity = productsCopy1.sort((a: IProduct, b: IProduct) => calculatePopularity(b) - calculatePopularity(a));
            setTrendingProducts(sortedByPopularity.slice(0, 12));

            // 2. Top Rated Products (by highest rating)
            const sortedByRating = productsCopy2.sort((a: IProduct, b: IProduct) => (b.rating || 0) - (a.rating || 0));
            setTopRatedProducts(sortedByRating.slice(0, 12));
            
            // 3. Newest Arrivals (by creation date)
            const sortedByDate = productsCopy3.sort((a: IProduct, b: IProduct) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
            setNewestProducts(sortedByDate.slice(0, 12));


            // 4. Group products by category for main sections
            const grouped = fetchedProducts.reduce((acc: GroupedProducts, product: IProduct) => {
                const category = product.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(product);
                return acc;
            }, {});
            setGroupedProducts(grouped);

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
            <Skeleton className="w-full h-[130px] md:h-[180px]" />
            <ProductCarouselSkeleton />
            <ProductCarouselSkeleton />
            <ProductCarouselSkeleton />
        </main>
    );
  }
  
  if (error || !brand) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">Brand not found</h1>
              <p className="text-muted-foreground">{error || 'The requested brand does not exist.'}</p>
          </main>
      )
  }
  
  const productSections = Object.entries(groupedProducts).filter(([_, items]) => {
    if (items.length < 2) return false;
    const topTwoProducts = items.slice(0, 2);
    return topTwoProducts.every(p => p.rating >= 3);
  });

  return (
    <>
    <main className="flex-1">
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
                        <div className="relative w-full h-[130px] md:h-[180px] bg-secondary text-foreground">
                            <Image
                                src={banner.imageUrl}
                                alt={banner.title}
                                fill
                                className="object-cover"
                                data-ai-hint={banner.imageHint}
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-black/50" />
                            <div className="container relative h-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center text-white">
                                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
                                    {banner.title}
                                </h1>
                                <p className="mt-4 text-base md:text-lg max-w-2xl">
                                    {banner.description}
                                </p>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
      
      <ProductCarouselSection title="Trending Products" products={trendingProducts} brandName={brandName} />
      <ProductCarouselSection title="Top Rated" products={topRatedProducts} brandName={brandName} />
      <ProductCarouselSection title="Newest Arrivals" products={newestProducts} brandName={brandName} />
      
      <CategoryBannerGrid brand={brand} />

      <div className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        {productSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productSections.map(([category, items]) => (
                <div key={category} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold tracking-tight">{category}</h2>
                        <Button variant="link" asChild>
                            <Link href={`/${brandName}/products?category=${encodeURIComponent(category)}`}>
                                Discover All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <Separator className="mb-6" />
                    <div className="grid grid-cols-2 gap-4">
                        {items.slice(0, 2).map((product) => (
                            <BrandProductCard key={product._id as string} product={product} />
                        ))}
                    </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No featured product categories available.</p>
          </div>
        )}
      </div>

      <OffersSection brand={brand} />
      <PromoBannerSection brand={brand} brandName={brandName} />
      <ReviewsSection brand={brand} />

    </main>
    <BrandFooter brand={brand} />
    </>
  );
}
