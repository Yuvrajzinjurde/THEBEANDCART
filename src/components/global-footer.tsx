
"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

import { Logo } from "@/components/logo";
import usePlatformSettingsStore from "@/stores/platform-settings-store";

export const GlobalFooter = () => {
    const { settings } = usePlatformSettingsStore();

    // Do not render the footer if settings are not yet loaded
    if (!settings.platformName) {
        return null;
    }

    return (
        <footer className="w-full border-t bg-background mt-16">
            <div className="container py-6 px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-2">
                        {settings.platformLogoUrl ? (
                            <div className="relative h-8 w-8 rounded-full">
                                <Image src={settings.platformLogoUrl} alt={`${settings.platformName} Logo`} fill className="object-cover" />
                            </div>
                        ) : (
                            <Logo className="h-6 w-6 text-primary" />
                        )}
                        <span className="font-bold">{settings.platformName}</span>
                    </div>
                    <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-sm text-muted-foreground">
                        <Link href="/legal/about-us" className="hover:text-primary">About Us</Link>
                        <Link href="/legal/privacy-policy" className="hover:text-primary">Policies</Link>
                        <Link href="/legal/contact-us" className="hover:text-primary">Contact Us</Link>
                    </div>
                    <div className="flex space-x-4">
                       {settings.socials?.twitter && <Link href={settings.socials.twitter} className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>}
                       {settings.socials?.facebook && <Link href={settings.socials.facebook} className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>}
                       {settings.socials?.instagram && <Link href={settings.socials.instagram} className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>}
                       {settings.socials?.linkedin && <Link href={settings.socials.linkedin} className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>}
                    </div>
                </div>
                 <div className="mt-4 border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {settings.platformName}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
