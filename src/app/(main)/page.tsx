
"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { IProduct } from '@/models/product.model';
import type { IPlatformSettings } from '@/models/platform.model';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Star, TrendingUp, Sparkles, Store } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Separator } from '@/components/ui/separator';
import { BrandProductCard } from '@/components/brand-product-card';
import { themeColors } from '@/lib/brand-schema';
import usePlatformSettingsStore from '@/stores/platform-settings-store';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';


const LandingPageSkeleton = () => (
    <main className="container flex-1 py-8 px-4">
        <div className="w-full px-4">
            <div className="space-y-8 animate-pulse">
                <div className="flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="space-y-4 text-center">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                </div>
                 <p className="my-8 text-center text-lg text-muted-foreground col-span-full">Just a moment, getting everything ready for you…</p>
            </div>
        </div>
    </main>
);


const ProductCarouselSection = ({ title, products, emoji }: { title: string, products: IProduct[], emoji?: string }) => {
    if (!products || products.length === 0) return null;
    return (
        <section className="w-full pt-12 container px-4">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                    {title}
                    {emoji && <span className="text-2xl">{emoji}</span>}
                </h2>
            </div>
            <Separator className="mb-6" />
            <Carousel
                opts={{ align: "start", loop: true }}
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

const PromoBannerSection = ({ settings }: { settings: IPlatformSettings | null }) => {
    if (!settings?.promoBannerEnabled || !settings?.promoBanner?.imageUrl) return null;
    const { imageUrl, imageHint, buttonLink } = settings.promoBanner;
    return (
        <section className="w-full py-12 container px-4">
            <Link href={buttonLink || '#'}>
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
};

const HamperSection = () => {
    const { settings } = usePlatformSettingsStore();
    
    if (!settings.hamperFeatureEnabled) return null;

    return (
        <section className="w-full py-12 container px-4">
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 backdrop-blur-sm">
                <div className="relative z-10 p-8 md:p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background">
                        <Gift className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Create Your Own Hamper</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Design a personalized gift hamper for any occasion. Choose the box, fill it with products, and add a personal touch.
                    </p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href="/create-hamper">
                            Start Creating <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};


const ShopByBrandSection = ({ brands }: { brands: IBrand[] }) => {
    const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
    const [canScroll, setCanScroll] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkScroll = () => {
            if (scrollContainerRef.current) {
                setCanScroll(scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth);
            }
        };
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [brands]);

    if (!brands || brands.length === 0) return null;

    const BrandLogo = ({ brand }: { brand: IBrand }) => {
        const theme = themeColors.find(t => t.name === brand.themeName);
        const primaryColor = theme ? `hsl(${theme.primary})` : 'hsl(var(--primary))';
        
        return (
            <Link href={`/${brand.permanentName}/home`} className="block group p-4 flex flex-col items-center flex-shrink-0">
                <div 
                    className="w-32 h-32 md:w-36 md:h-36 relative rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-105"
                    style={{ 
                        borderColor: primaryColor,
                        boxShadow: `0 0 12px 2px ${primaryColor}66` 
                    }}
                >
                    <Image
                        src={brand.logoUrl}
                        alt={`${brand.displayName} Logo`}
                        fill
                        className="object-cover"
                    />
                </div>
                 <p className="mt-3 font-semibold text-center">{brand.displayName}</p>
            </Link>
        );
    };

    return (
        <section className="w-full py-12 container px-4">
             <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                    <Store className="h-8 w-8" />
                    Featured Brands
                </h2>
                <p className="mt-2 text-muted-foreground">Explore our hand-picked collection of top brands.</p>
            </div>
            {canScroll ? (
                <Carousel
                    plugins={[autoplay.current]}
                    opts={{ align: "start", loop: true }}
                    className="w-full"
                >
                    <CarouselContent>
                        {brands.map((brand) => (
                            <CarouselItem key={brand.permanentName} className="basis-auto">
                                <BrandLogo brand={brand} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                </Carousel>
            ) : (
                <div ref={scrollContainerRef} className="flex justify-center items-center gap-4">
                    {brands.map((brand) => (
                        <BrandLogo key={brand.permanentName} brand={brand} />
                    ))}
                </div>
            )}
        </section>
    );
};


export default function LandingPage() {
  const { settings } = usePlatformSettingsStore();
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendingProducts, setTrendingProducts] = useState<IProduct[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<IProduct[]>([]);
  const [newestProducts, setNewestProducts] = useState<IProduct[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  
  const mainCarouselPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    async function fetchData() {
        if (!settings || !settings.platformName) return; 
        try {
            setLoading(true);
            const [
              trendingResponse,
              topRatedResponse,
              newestResponse,
              brandResponse,
            ] = await Promise.all([
              fetch('/api/products?sortBy=popular&limit=12'),
              fetch('/api/products?sortBy=rating&limit=12'),
              fetch('/api/products?sortBy=newest&limit=12'),
              fetch('/api/brands'),
            ]);
            
            if (!trendingResponse.ok || !topRatedResponse.ok || !newestResponse.ok || !brandResponse.ok) {
              throw new Error('Failed to fetch initial page data');
            }
            
            const [trendingData, topRatedData, newestData, brandData] = await Promise.all([
              trendingResponse.json(),
              topRatedResponse.json(),
              newestResponse.json(),
              brandResponse.json(),
            ]);

            setTrendingProducts(trendingData.products);
            setTopRatedProducts(topRatedData.products);
            setNewestProducts(newestData.products);
            
            const allBrands: IBrand[] = brandData.brands;
            const featuredBrandNames = settings.featuredBrands || [];
            if (featuredBrandNames.length > 0) {
                setBrands(allBrands.filter(b => featuredBrandNames.includes(b.permanentName)));
            } else {
                setBrands(allBrands);
            }
            
            const allProducts = [
                ...trendingData.products, 
                ...topRatedData.products, 
                ...newestData.products
            ];
            const categories = new Set(allProducts.map(p => Array.isArray(p.category) ? p.category[0] : p.category));
            setUniqueCategories(Array.from(categories).slice(0, 12));


          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
    }
    
    if (settings && settings.platformName) {
      fetchData();
    }
  }, [settings]);

  const platformSettings = settings as IPlatformSettings;
  
  if (!platformSettings || !platformSettings.platformName) {
      return <LandingPageSkeleton />;
  }
  
  const heroBanners = platformSettings.heroBanners || [];

  return (
    <main className="w-full flex-1">
      {heroBanners && heroBanners.length > 0 && (
           <section className="w-full hidden sm:block">
              <Carousel 
                  className="w-full" 
                  plugins={[mainCarouselPlugin.current]}
                  onMouseEnter={() => mainCarouselPlugin.current.stop()}
                  onMouseLeave={() => mainCarouselPlugin.current.reset()}
              >
                  <CarouselContent>
                  {heroBanners.map((banner, index) => (
                      <CarouselItem key={index}>
                         <Link href={banner.buttonLink || '#'}>
                              <div className="relative w-full text-foreground flex items-center justify-center py-16 sm:py-20 md:py-28">
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
      )}
      
      <div className="container px-4">
        <section className="text-center py-16">
            <h2 className="text-xl font-semibold text-muted-foreground sm:text-2xl">A home for curated experiences.</h2>
            <p className="mt-2 max-w-2xl mx-auto text-foreground/80">From hampers to unique brands like Reeva, Nevermore, and beyond – everything starts here.</p>
        </section>
      </div>

        <HamperSection />
        <ShopByBrandSection brands={brands} />

        {loading ? (
            <div className="container px-4 flex flex-col items-center justify-center text-center py-16">
                <Loader className="h-12 w-12" />
                <p className="my-8 text-center text-lg text-muted-foreground">Just a moment, getting everything ready for you…</p>
            </div>
        ) : error ? (
            <div className="container px-4 text-center text-destructive py-16">
                <p>Could not load products. Please try again later.</p>
            </div>
        ) : (
            <>
                <ProductCarouselSection title="Trending Now" products={trendingProducts} emoji="📈" />
                
                <PromoBannerSection settings={platformSettings} />
                
                <ProductCarouselSection title="Top Rated Picks" products={topRatedProducts} emoji="⭐" />
                <ProductCarouselSection title="Newest Arrivals" products={newestProducts} emoji="✨" />
                
                {uniqueCategories.length > 0 && (
                    <section className="pt-16 container px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Explore by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {uniqueCategories.map(category => (
                                <Link key={category} href={`/reeva/products?category=${encodeURIComponent(category)}`} className="block group">
                                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                             <span className="text-3xl mb-2">🛍️</span>
                                             <h3 className="text-sm font-semibold truncate w-full">{category}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
                 <section className="py-16 text-center container px-4">
                    <h2 className="text-2xl font-bold text-foreground">A Personalized Experience, Coming Soon</h2>
                    <p className="mt-2 max-w-xl mx-auto text-muted-foreground">We’ll soon let you design your own cart experience. Stay tuned for AI-driven suggestions and more!</p>
                </section>
            </>
        )}
    </main>
  );
}
