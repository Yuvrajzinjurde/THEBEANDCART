

"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { IProduct } from '@/models/product.model';
import type { IBrand } from '@/models/brand.model';
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

const BoughtTogetherSection = ({ products }: { products: IProduct[] }) => {
  if (products.length < 2) return null;

  const totalPrice = products.reduce((sum, product) => sum + product.sellingPrice, 0);

  return (
    <section className="pt-16">
      <h2 className="text-2xl font-bold tracking-tight">Frequently Bought Together</h2>
      <Separator className="my-4" />
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 bg-muted/50 p-8 rounded-lg">
        <div className="flex items-center gap-4 overflow-x-auto">
          {products.map((p, index) => (
            <React.Fragment key={p._id as string}>
              <div className="w-32 flex-shrink-0">
                <BrandProductCard product={p} />
              </div>
              {index < products.length - 1 && <Plus className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex-shrink-0 text-center md:text-left">
          <p className="font-semibold">Total Price:</p>
          <p className="text-2xl font-bold">₹{totalPrice.toLocaleString('en-IN')}</p>
          <Button className="mt-2">Add all to cart</Button>
        </div>
      </div>
    </section>
  );
};


const BrandFooter = ({ brand }: { brand: IBrand | null }) => (
    <footer className="w-full border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                        {brand?.logoUrl && (
                            <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} width={40} height={40} className="h-10 w-10 object-cover rounded-full" />
                        )}
                        <span className="text-xl font-bold capitalize">{brand?.displayName}</span>
                    </div>
                     <p className="text-sm text-muted-foreground mt-4">Your one-stop shop for everything great.</p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">About</h3>
                    <ul className="mt-4 space-y-2">
                        <li><Link href={`/${brand?.permanentName}/legal/about-us`} className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
                        <li><Link href={`/${brand?.permanentName}/legal/contact-us`} className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
                    <ul className="mt-4 space-y-2">
                        <li><Link href={`/${brand?.permanentName}/legal/contact-us`} className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
                        <li><Link href={`/${brand?.permanentName}/legal/shipping-policy`} className="text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
                    <ul className="mt-4 space-y-2">
                         <li><Link href={`/${brand?.permanentName}/legal/privacy-policy`} className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                        <li><Link href={`/${brand?.permanentName}/legal/terms-and-conditions`} className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                        <li><Link href={`/${brand?.permanentName}/legal/refund-policy`} className="text-sm text-muted-foreground hover:text-primary">Refund Policy</Link></li>
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
            <div className="mt-8 border-t pt-4">
                <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {brand?.displayName}. All rights reserved.</p>
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

  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  const [boughtTogether, setBoughtTogether] = useState<IProduct[]>([]);

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

        // Fetch brand data for the footer
        if (mainProduct.storefront) {
          const brandResponse = await fetch(`/api/brands/${mainProduct.storefront}`);
          if (brandResponse.ok) {
            const brandData = await brandResponse.json();
            setBrand(brandData.brand);
          }
        }

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
  }, [id, addProduct]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 text-primary" />
      </div>
    );
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
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ProductDetails product={product} variants={variants.length > 0 ? variants : [product]} storefront={storefront} />
        
        <BoughtTogetherSection products={boughtTogether} />
        
        <div className="mt-16">
          <ProductCarouselSection title="Similar Products" products={similarProducts} isLoading={loadingSimilar} />
          <ProductCarouselSection title="Recently Viewed" products={filteredRecentlyViewed} />
        </div>
      </main>
      <BrandFooter brand={brand} />
    </>
  );
}

