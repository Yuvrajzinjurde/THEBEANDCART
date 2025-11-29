

"use client";

import Image from "next/image";
import Link from "next/link";
<<<<<<< HEAD
import { X, Facebook, Instagram, Linkedin } from "lucide-react";

import { Logo } from "@/components/logo";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { Skeleton } from "./ui/skeleton";
=======
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Logo } from "@/components/logo";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import type { IBrand } from "@/models/brand.model";
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

export const GlobalFooter = () => {
    const { settings } = usePlatformSettingsStore();
    const params = useParams();
    const [brand, setBrand] = useState<IBrand | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const brandNameFromUrl = params.brand as string;

    useEffect(() => {
        async function fetchBrandData() {
            if (brandNameFromUrl) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/brands/${brandNameFromUrl}`);
                    if (res.ok) {
                        const { brand: brandData } = await res.json();
                        setBrand(brandData);
                    } else {
                        setBrand(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch brand data for footer", error);
                    setBrand(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setBrand(null);
                setIsLoading(false);
            }
        }
        fetchBrandData();
    }, [brandNameFromUrl]);
    
    // Determine which details to show: brand-specific or global platform
    const displayData = {
        name: brand?.displayName || settings.platformName,
        logoUrl: brand?.logoUrl || settings.platformLogoUrl,
        socials: brand?.socials || settings.socials,
        baseLink: brandNameFromUrl ? `/${brandNameFromUrl}` : ''
    };

    if (isLoading || !displayData.name) {
        return null; // Don't render the footer until we know what to display
    }

    return (
        <footer className="w-full border-t bg-background mt-16">
            <div className="container py-6 px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-2">
                        {displayData.logoUrl ? (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                <Image src={displayData.logoUrl} alt={`${displayData.name} Logo`} fill className="object-cover" />
                            </div>
                        ) : (
                            <Skeleton className="h-8 w-8 rounded-full" />
                        )}
<<<<<<< HEAD
                        <span className="font-bold">{settings.platformName || <Skeleton className="h-6 w-24" />}</span>
                    </div>
                    <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                        <Link href="/legal/about-us" className="hover:text-primary">About Us</Link>
                        <Link href="/legal/privacy-policy" className="hover:text-primary">Policies</Link>
                        <Link href="/legal/contact-us" className="hover:text-primary">Contact Us</Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                    </div>
                </div>
                 <div className="mt-4 border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {settings.platformName || 'The Brand Cart'}. All rights reserved.</p>
=======
                        <span className="font-bold capitalize">{displayData.name}</span>
                    </div>
                    <div className="flex items-center gap-x-6 gap-y-2">
                        <div className="hidden sm:flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                            <Link href={`${displayData.baseLink || ''}/legal/about-us`} className="hover:text-primary">About Us</Link>
                            <Link href={`${displayData.baseLink || ''}/legal/privacy-policy`} className="hover:text-primary">Policies</Link>
                            <Link href={`${displayData.baseLink || ''}/legal/contact-us`} className="hover:text-primary">Contact Us</Link>
                        </div>
                        <div className="flex space-x-4">
                           {displayData.socials?.twitter && <Link href={displayData.socials.twitter} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5" /></Link>}
                           {displayData.socials?.facebook && <Link href={displayData.socials.facebook} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></Link>}
                           {displayData.socials?.instagram && <Link href={displayData.socials.instagram} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></Link>}
                           {displayData.socials?.linkedin && <Link href={displayData.socials.linkedin} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /></Link>}
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:hidden flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                    <Link href={`${displayData.baseLink || ''}/legal/about-us`} className="hover:text-primary">About Us</Link>
                    <Link href={`${displayData.baseLink || ''}/legal/privacy-policy`} className="hover:text-primary">Policies</Link>
                    <Link href={`${displayData.baseLink || ''}/legal/contact-us`} className="hover:text-primary">Contact Us</Link>
                </div>
                 <div className="mt-4 border-t pt-4 text-center">
                    <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {displayData.name}. All rights reserved.</p>
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
                </div>
            </div>
        </footer>
    );
};

    