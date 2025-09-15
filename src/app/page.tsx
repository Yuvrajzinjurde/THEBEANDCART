
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';


const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold sm:inline-block">Storefront Platform</span>
            </Link>
            <nav className="flex items-center gap-4">
                <Link href="#brands" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    Brands
                </Link>
                 <Link href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    About
                </Link>
            </nav>
        </div>
    </header>
);

const LandingFooter = () => (
    <footer className="w-full border-t bg-background">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 py-12 sm:px-6 lg:px-8">
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">About</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Press</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
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
             <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Storefront Platform, Inc. All rights reserved.</p>
        </div>
    </footer>
);

export default function LandingPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data.brands);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  return (
    <>
    <LandingHeader />
    <main className="flex-1 flex flex-col items-center bg-background">
        
        <section className="w-full bg-secondary text-center py-10 sm:py-16">
            <div className="container mx-auto px-4">
                <p className="font-semibold text-primary">LIMITED TIME OFFER</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2">Get 20% Off Your First Order from Any Brand!</h2>
                <p className="text-muted-foreground mt-2">Use code <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">WELCOME20</span> at checkout.</p>
                <Button size="lg" className="mt-6">Explore Brands</Button>
            </div>
        </section>

        <section id="brands" className="w-full py-12 sm:py-20 px-4 sm:px-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    Welcome to Our Storefront Platform
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Explore our collection of unique brands. Select a brand below to start shopping.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader className="h-12 w-12" />
                    <p className="mt-4 text-muted-foreground">Loading our brands...</p>
                </div>
            ) : error ? (
                <div className="text-center text-destructive">
                <p>Could not load brands. Please try again later.</p>
                </div>
            ) : (
                <div className="w-full max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {brands.map((brand) => (
                           <Link key={brand.permanentName} href={`/${brand.permanentName}/home`} className="block group">
                                <Card className="relative overflow-hidden rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                                    <CardContent className="p-0">
                                        <div className="aspect-square relative bg-muted flex items-center justify-center">
                                            <Image
                                                src={brand.logoUrl}
                                                alt={`${brand.displayName} Logo`}
                                                width={120}
                                                height={120}
                                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-50"></div>
                                        </div>
                                        <div className="p-4 border-t">
                                            <h2 className="text-center text-lg font-bold text-foreground">{brand.displayName}</h2>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    </main>
    <LandingFooter />
    </>
  );
}
