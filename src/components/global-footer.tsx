
"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

import { Logo } from "@/components/logo";
import usePlatformSettingsStore from "@/stores/platform-settings-store";

export const GlobalFooter = () => {
    const { settings } = usePlatformSettingsStore();
    return (
        <footer className="w-full border-t bg-background mt-16">
            <div className="container py-6 px-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-2">
                        {settings.platformLogoUrl ? (
                            <Image src={settings.platformLogoUrl} alt={`${settings.platformName} Logo`} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                            <Logo className="h-6 w-6 text-primary" />
                        )}
                        <span className="font-bold">{settings.platformName || 'The Brand Cart'}</span>
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
                 <div className="mt-4 border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {settings.platformName || 'The Brand Cart'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
