
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { IBrand } from '@/models/brand.model';
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
import Autoplay from "embla-carousel-autoplay";
import { Loader } from '@/components/ui/loader';
import { BrandProductCard } from '@/components/brand-product-card';
import { Twitter, Facebook, Instagram, Linkedin, ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type GroupedProducts = {
  [category: string]: IProduct[];
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
        <section id="categories" className="w-full py-12 sm:py-20 px-4 sm:px-8 bg-muted/30">
             <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Shop by Category
                </h2>
                <p className="mt-3 max-w-xl mx-auto text-lg text-muted-foreground">
                    Find what you're looking for from our curated selection of categories.
                </p>
            </div>
            <div className="container mx-auto p-4 md:p-8 rounded-2xl bg-gradient-to-br from-blue-100/50 to-blue-200/50">
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
        </section>
    );
};


const OffersSection = ({ brand }: { brand: IBrand | null }) => {
    if (!brand?.offers || brand.offers.length === 0) return null;
    return (
        <section className="w-full py-12 md:py-16 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Special Offers</h2>
                    <p className="text-muted-foreground mt-2">Don't miss out on these exclusive deals!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {brand.offers.map((offer, index) => (
                        <Card key={index} className="flex flex-col items-center text-center p-6 border-dashed border-2 hover:border-primary hover:shadow-lg transition-all">
                             <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <ShoppingBag className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">{offer.title}</CardTitle>
                            <p className="text-muted-foreground mt-2 flex-grow">{offer.description}</p>
                            <div className="mt-4">
                                <span className="text-sm text-muted-foreground">Use Code:</span>
                                <Badge variant="secondary" className="text-lg ml-2">{offer.code}</Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PromoBannerSection = ({ brand }: { brand: IBrand | null }) => {
    if (!brand?.promoBanner) return null;
    const { title, description, imageUrl, imageHint, buttonText, buttonLink } = brand.promoBanner;
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative rounded-lg overflow-hidden h-[400px] bg-secondary text-foreground flex items-center">
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

const ReviewsSection = ({ brand }: { brand: IBrand | null }) => {
    if (!brand?.reviews || brand.reviews.length === 0) return null;
    return (
        <section className="w-full py-12 md:py-16">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What Our Customers Say</h2>
                </div>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {brand.reviews.map((review, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                                <Card className="p-6 text-center h-full flex flex-col justify-between shadow-sm hover:shadow-xl transition-shadow">
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
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
             </div>
        </section>
    );
};


const BrandFooter = ({ brand }: { brand: IBrand | null }) => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3">
                    {brand?.logoUrl && (
                        <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={40} height={40} className="h-10 w-10 object-contain" />
                    )}
                    <span className="text-xl font-bold capitalize">{brand?.displayName}</span>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-primary">About Us</Link>
                    <Link href="#" className="hover:text-primary">Contact</Link>
                    <Link href="#" className="hover:text-primary">FAQ</Link>
                    <Link href="#" className="hover:text-primary">Shipping & Returns</Link>
                </nav>
                <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
            <div className="mt-8 border-t pt-4">
                <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {brand?.displayName}. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

export default function BrandHomePage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const brandName = params.brand as string;

  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const plugin = useRef(
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
            setProducts(productData.products);

            // Group products by category
            const grouped = productData.products.reduce((acc: GroupedProducts, product: IProduct) => {
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
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader className="h-12 w-12" />
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

  return (
    <>
    <main className="flex-1">
        <section className="w-full">
            <Carousel 
                className="w-full"
                plugins={[plugin.current]}
                onMouseEnter={() => plugin.current.stop()}
                onMouseLeave={() => plugin.current.reset()}
            >
                <CarouselContent>
                {brand.banners.map((banner, index) => (
                    <CarouselItem key={index}>
                        <div className="relative w-full h-[150px] md:h-[200px] bg-secondary text-foreground">
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

      <CategoryBannerGrid brand={brand} />

      <div className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        {Object.keys(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([category, items]) => (
            <section key={category} className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{category}</h2>
                 <Button variant="link" asChild>
                    <Link href={`/${brandName}/products?category=${encodeURIComponent(category)}`}>
                        Discover All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </div>
              <Separator className="mb-6" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.slice(0, 5).map((product) => (
                  <BrandProductCard key={product._id as string} product={product} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No products found for this brand yet.</p>
          </div>
        )}
      </div>

        <OffersSection brand={brand} />
        <PromoBannerSection brand={brand} />
        <ReviewsSection brand={brand} />

    </main>
    <BrandFooter brand={brand} />
    </>
  );
}
