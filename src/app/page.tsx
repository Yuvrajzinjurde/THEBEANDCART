

"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { IProduct } from '@/models/product.model';
import type { IPlatformSettings } from '@/models/platform.model';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
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

const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold sm:inline-block">The Brand Cart</span>
            </Link>
            <nav className="flex items-center gap-4">
                 <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    Admin
                </Link>
            </nav>
        </div>
    </header>
);

const LandingFooter = () => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                     <Logo className="h-6 w-6 text-primary" />
                    <span className="font-bold">The Brand Cart</span>
                </div>
                 <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                    <Link href="/legal/about-us" className="hover:text-primary">About Us</Link>
                    <Link href="/legal/privacy-policy" className="hover:text-primary">Policies</Link>
                    <Link href="/legal/contact-us" className="hover:text-primary">Contact Us</Link>
                </div>
                 <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
            <div className="mt-8 border-t pt-4">
                 <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} The Brand Cart. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

const ProductCarouselSection = ({ title, products }: { title: string, products: IProduct[] }) => {
    if (!products || products.length === 0) return null;
    return (
        <section className="container mx-auto px-4 pt-12 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
            </div>
            <Separator className="mb-6" />
            <Carousel
                opts={{ align: "start", loop: true }}
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
                <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </Carousel>
        </section>
    );
};

const OffersSection = ({ settings }: { settings: IPlatformSettings | null }) => {
    if (!settings?.offers || settings.offers.length === 0) return null;
    
    const offerIcons = [
        <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
        <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>,
    ];

    return (
        <section className="w-full py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-r from-teal-50/50 to-blue-50/50 rounded-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Today's Top Offers</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {settings.offers.map((offer, index) => (
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


const PromoBannerSection = ({ settings }: { settings: IPlatformSettings | null }) => {
    if (!settings?.promoBanner?.imageUrl) return null;
    const { title, description, imageUrl, imageHint, buttonText, buttonLink } = settings.promoBanner;
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative rounded-lg overflow-hidden h-[400px] md:h-[320px] bg-secondary text-foreground flex items-center">
                 <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    data-ai-hint={imageHint}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 p-8 md:p-16 max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">{title}</h2>
                    <p className="text-lg text-white/90 mt-4">{description}</p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href={buttonLink}>
                            {buttonText} <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
};

const ShopByBrandSection = ({ brands }: { brands: IBrand[] }) => {
    if (!brands || brands.length === 0) return null;

    return (
        <section className="w-full py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Shop by Brand</h2>
                </div>
                <Carousel
                    opts={{
                        align: "center",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {brands.map((brand) => {
                            const theme = themeColors.find(t => t.name === brand.themeName);
                            const primaryColor = theme ? `hsl(${theme.primary})` : 'hsl(var(--primary))';
                            
                            return (
                                <CarouselItem key={brand.permanentName} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                                    <Link href={`/${brand.permanentName}/home`} className="block group p-4 flex flex-col items-center">
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
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                    <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                </Carousel>
            </div>
        </section>
    );
};


export default function LandingPage() {
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [platformSettings, setPlatformSettings] = useState<IPlatformSettings | null>(null);
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
        try {
            setLoading(true);
            // Fetch all products, platform settings, and brands in parallel
            const [productResponse, settingsResponse, brandResponse] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/platform'),
                fetch('/api/brands'),
            ]);
            
            if (!productResponse.ok) throw new Error('Failed to fetch products');
            if (!brandResponse.ok) throw new Error('Failed to fetch brands');
            
            const productData = await productResponse.json();
            const fetchedProducts: IProduct[] = productData.products;
            setAllProducts(fetchedProducts);
            
            const brandData = await brandResponse.json();
            setBrands(brandData.brands);

            let settingsData: IPlatformSettings | null = null;
            if (settingsResponse.ok) {
                settingsData = await settingsResponse.json();
                setPlatformSettings(settingsData);
            }

            // --- Sort and Slice Products for Carousels ---
            const productsCopy1 = JSON.parse(JSON.stringify(fetchedProducts));
            const productsCopy2 = JSON.parse(JSON.stringify(fetchedProducts));
            const productsCopy3 = JSON.parse(JSON.stringify(fetchedProducts));

            const calculatePopularity = (p: IProduct) => (p.views || 0) + (p.clicks || 0) * 2;
            const sortedByPopularity = productsCopy1.sort((a: IProduct, b: IProduct) => calculatePopularity(b) - calculatePopularity(a));
            setTrendingProducts(sortedByPopularity.slice(0, 12));

            const sortedByRating = productsCopy2.sort((a: IProduct, b: IProduct) => (b.rating || 0) - (a.rating || 0));
            setTopRatedProducts(sortedByRating.slice(0, 12));

            const sortedByDate = productsCopy3.sort((a: IProduct, b: IProduct) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
            setNewestProducts(sortedByDate.slice(0, 12));

            // Use featured categories from settings, or derive from products as a fallback
            if (settingsData && settingsData.featuredCategories.length > 0) {
                setUniqueCategories(settingsData.featuredCategories);
            } else {
                const categories = new Set(fetchedProducts.map(p => Array.isArray(p.category) ? p.category[0] : p.category));
                setUniqueCategories(Array.from(categories).slice(0, 12));
            }

          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
    }
    fetchData();
  }, []);

  const heroBanners = platformSettings?.heroBanners;

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <Loader className="h-16 w-16" />
            <p className="mt-4 text-lg text-muted-foreground animate-pulse">Loading universe of brands...</p>
        </div>
      );
  }

  return (
    <>
    <LandingHeader />
    <main className="flex-1 flex flex-col items-center bg-background">

        {heroBanners && heroBanners.length > 0 ? (
             <section className="w-full">
                <Carousel 
                    className="w-full" 
                    plugins={[mainCarouselPlugin.current]}
                    onMouseEnter={() => mainCarouselPlugin.current.stop()}
                    onMouseLeave={() => mainCarouselPlugin.current.reset()}
                >
                    <CarouselContent>
                    {heroBanners.map((banner, index) => (
                        <CarouselItem key={index}>
                            <div className="relative w-full h-[250px] md:h-[400px] bg-secondary text-foreground">
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
        ) : (
            <section className="w-full py-12 sm:py-20 px-4 sm:px-8 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    Your Universe of Brands
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Discover curated products from a constellation of unique brands, all in one place.
                </p>
            </section>
        )}
        
        <ShopByBrandSection brands={brands} />

        {loading ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
                <Loader className="h-12 w-12" />
                <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
        ) : error ? (
            <div className="text-center text-destructive py-16">
                <p>Could not load products. Please try again later.</p>
            </div>
        ) : (
            <>
                <ProductCarouselSection title="Trending Now" products={trendingProducts} />
                
                <PromoBannerSection settings={platformSettings} />
                
                <OffersSection settings={platformSettings} />
                
                <ProductCarouselSection title="Top Rated Picks" products={topRatedProducts} />
                <ProductCarouselSection title="Newest Arrivals" products={newestProducts} />
                
                {uniqueCategories.length > 0 && (
                    <section className="container mx-auto px-4 pt-16 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Explore by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
            </>
        )}

    </main>
    <LandingFooter />
    </>
  );
}
    

    