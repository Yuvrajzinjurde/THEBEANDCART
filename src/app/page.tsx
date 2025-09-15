
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { IBrand } from '@/models/brand.model';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';

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
    <main className="flex min-h-screen flex-col items-center bg-muted/40 p-4 sm:p-8">
        <div className="text-center mb-10">
            <div className="inline-block p-4 bg-background rounded-full shadow-md mb-4">
                <Logo className="h-16 w-16 text-primary" />
            </div>
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
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link key={brand.permanentName} href={`/${brand.permanentName}/home`} passHref>
                <Card className="group relative overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="aspect-video relative">
                        <Image
                            src={brand.logoUrl}
                            alt={`${brand.displayName} Logo`}
                            fill
                            className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
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
    </main>
  );
}
