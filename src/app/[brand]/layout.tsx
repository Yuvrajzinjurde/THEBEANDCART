
'use client';

import { useAuth } from '@/hooks/use-auth';
import type { IBrand } from '@/models/brand.model';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useParams } from 'next/navigation';

const BrandFooter = ({ brand }: { brand: IBrand | null }) => {
    // Only render the footer if brand data is available
    if (!brand) {
        return null;
    }
    
    return (
        <footer className="w-full border-t bg-background mt-auto">
            <div className="container py-8 px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {brand.logoUrl && (
                            <div className="relative h-8 w-8 rounded-full">
                                <Image src={brand.logoUrl} alt={`${brand.displayName} Logo`} fill className="object-cover" />
                            </div>
                        )}
                        <span className="text-lg font-bold capitalize">{brand.displayName}</span>
                    </div>
                    <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                        <Link href={`/${brand.permanentName}/legal/about-us`} className="hover:text-primary">About Us</Link>
                        <Link href={`/${brand.permanentName}/legal/privacy-policy`} className="hover:text-primary">Policies</Link>
                        <Link href={`/${brand.permanentName}/legal/contact-us`} className="hover:text-primary">Contact Us</Link>
                    </div>
                    <div className="flex space-x-4">
                        {brand.socials?.twitter && <Link href={brand.socials.twitter} className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>}
                        {brand.socials?.facebook && <Link href={brand.socials.facebook} className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>}
                        {brand.socials?.instagram && <Link href={brand.socials.instagram} className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>}
                        {brand.socials?.linkedin && <Link href={brand.socials.linkedin} className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>}
                    </div>
                </div>
                <div className="mt-8 border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {brand.displayName}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};


export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const params = useParams();
    const brandName = params.brand as string;
    const [brand, setBrand] = useState<IBrand | null>(null);

    useEffect(() => {
        async function fetchBrandData() {
            if (!brandName) return;
            try {
                const brandRes = await fetch(`/api/brands/${brandName}`);
                if (brandRes.ok) {
                    const { brand: brandData } = await brandRes.json();
                    setBrand(brandData);
                }
            } catch (error) {
                console.error("Failed to fetch brand data for layout", error);
            }
        }
        fetchBrandData();
    }, [brandName]);


  return (
    <>
      {children}
      <BrandFooter brand={brand} />
    </>
  );
}
