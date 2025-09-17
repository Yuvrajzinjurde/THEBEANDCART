
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { IProduct } from '@/models/product.model';
import type { IPlatformSettings } from '@/models/platform.model';
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
import { Separator } from '@/components/ui/separator';
import { BrandProductCard } from '@/components/brand-product-card';


const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold sm:inline-block">Brandify</span>
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
    <footer className="w-full border-t bg-background">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 px-4 py-12 sm:px-6 lg:px-8">
            <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold">Brandify</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">The best place to find your new favorite brands.</p>
            </div>
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">About</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="/legal/about-us" className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
                    <li><Link href="/legal/contact-us" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="/legal/contact-us" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
                    <li><Link href="/legal/shipping-policy" className="text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="/legal/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    <li><Link href="/legal/terms-and-conditions" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    <li><Link href="/legal/refund-policy" className="text-sm text-muted-foreground hover:text-primary">Refund Policy</Link></li>
                </ul>
            </div>
            <div>
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Connect</h3>
                <div className="mt-4 flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
        </div>
        <div className="border-t py-4">
             <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Brandify, Inc. All rights reserved.</p>
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

const PromoBannerSection = ({ settings }: { settings: IPlatformSettings | null }) => {
    if (!settings?.promoBanner?.imageUrl) return null;
    const { title, description, imageUrl, imageHint, buttonText, buttonLink } = settings.promoBanner;
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative rounded-lg overflow-hidden h-[320px] bg-secondary text-foreground flex items-center">
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
}

export default function LandingPage() {
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [platformSettings, setPlatformSettings] = useState<IPlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendingProducts, setTrendingProducts] = useState<IProduct[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<IProduct[]>([]);
  const [newestProducts, setNewestProducts] = useState<IProduct[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch all products and platform settings in parallel
        const [productResponse, settingsResponse] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/platform')
        ]);
        
        if (!productResponse.ok) throw new Error('Failed to fetch products');
        const productData = await productResponse.json();
        const fetchedProducts: IProduct[] = productData.products;
        setAllProducts(fetchedProducts);

        if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
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
        if (platformSettings && platformSettings.featuredCategories.length > 0) {
            setUniqueCategories(platformSettings.featuredCategories);
        } else {
            const categories = new Set(fetchedProducts.map(p => p.category));
            setUniqueCategories(Array.from(categories).slice(0, 12));
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [platformSettings]);

  const heroBanners = platformSettings?.heroBanners;

  return (
    <>
    <LandingHeader />
    <main className="flex-1 flex flex-col items-center bg-background">

        {heroBanners && heroBanners.length > 0 ? (
             <section className="w-full">
                <Carousel className="w-full" plugins={[require('embla-carousel-autoplay').default()]}>
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
                
                <ProductCarouselSection title="Top Rated Picks" products={topRatedProducts} />
                <ProductCarouselSection title="Newest Arrivals" products={newestProducts} />
                
                {uniqueCategories.length > 0 && (
                    <section className="container mx-auto px-4 pt-16 sm:px-6 lg:px-8">
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
            </>
        )}

    </main>
    <LandingFooter />
    </>
  );
}

    