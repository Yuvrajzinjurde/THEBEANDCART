
"use client";

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import Header from '@/components/header';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { IBrand } from '@/models/brand.model';
import { themeColors } from '@/lib/brand-schema';
import usePlatformSettingsStore from '@/stores/platform-settings-store';
import type { IPlatformSettings } from '@/models/platform.model';

type Theme = (typeof themeColors)[number];


function ThemeInjector({ brandName }: { brandName: string | null }) {
    const { settings } = usePlatformSettingsStore();
    const [theme, setTheme] = useState<(typeof themeColors)[number] | undefined>(
        themeColors.find(t => t.name === 'Blue')
    );

    useEffect(() => {
        async function fetchBrandTheme() {
            let selectedThemeName = settings.platformThemeName; // Default to global theme

            if (brandName && brandName !== 'admin') {
                try {
                    const res = await fetch(`/api/brands/${brandName}`);
                    if (res.ok) {
                        const { brand }: { brand: IBrand } = await res.json();
                        selectedThemeName = brand.themeName;
                    }
                } catch (error) {
                    console.error("Failed to fetch brand theme", error);
                }
            }

            const newTheme = themeColors.find(t => t.name === selectedThemeName) || themeColors.find(t => t.name === 'Blue');
            setTheme(newTheme);
        }
        fetchBrandTheme();
    }, [brandName, settings.platformThemeName]);
    
    useEffect(() => {
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--primary', theme.primary);
            root.style.setProperty('--background', theme.background);
            root.style.setProperty('--accent', theme.accent);
            
            if (theme.name.includes('(Dark)')) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);


  return null;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { settings, fetchSettings } = usePlatformSettingsStore();

  const stableFetchSettings = useCallback(fetchSettings, []);

  useEffect(() => {
    stableFetchSettings();
  }, [stableFetchSettings]);

  useEffect(() => {
    if (settings.platformFaviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = settings.platformFaviconUrl;
    }
    if (settings.platformName) {
        document.title = settings.platformName;
    }
  }, [settings.platformFaviconUrl, settings.platformName]);
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = /\/login|\/signup|\/forgot-password/.test(pathname);
  
  const getBrandName = () => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/legal') || pathname === '/' || pathname === '/wishlist' || pathname === '/create-hamper') {
      return null;
    }
    
    const pathParts = pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] && pathParts[1] !== 'products') {
      return pathParts[1];
    }

    const storefrontQuery = searchParams.get('storefront');
    if (storefrontQuery) {
        return storefrontQuery;
    }

    return 'reeva';
  }
  
  const brandName = getBrandName();
  const showHeader = !isAdminRoute && !isAuthRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInjector brandName={brandName} />
      </head>
      <body className="flex min-h-screen flex-col font-body antialiased">
        <AuthProvider>
          {showHeader && <Header />}
          {children}
        </AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
