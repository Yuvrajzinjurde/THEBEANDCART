
"use client";

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import Header from '@/components/header';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { IBrand } from '@/models/brand.model';
import { themeColors } from '@/lib/brand-schema';

type Theme = (typeof themeColors)[number];


function ThemeInjector({ brandName }: { brandName: string | null }) {
    const [theme, setTheme] = useState<(typeof themeColors)[number] | undefined>(
        themeColors.find(t => t.name === 'Blue')
    );

    useEffect(() => {
        async function fetchBrandTheme() {
            if (!brandName || brandName === 'admin') {
                const defaultTheme = themeColors.find(t => t.name === 'Blue');
                setTheme(defaultTheme);
                return;
            }

            try {
                const res = await fetch(`/api/brands/${brandName}`);
                if (res.ok) {
                    const { brand }: { brand: IBrand } = await res.json();
                    const selectedTheme = themeColors.find(t => t.name === brand.themeName) || themeColors.find(t => t.name === 'Blue');
                    setTheme(selectedTheme);
                } else {
                     const defaultTheme = themeColors.find(t => t.name === 'Blue');
                     setTheme(defaultTheme);
                }
            } catch (error) {
                console.error("Failed to fetch brand theme", error);
                const defaultTheme = themeColors.find(t => t.name === 'Blue');
                setTheme(defaultTheme);
            }
        }
        fetchBrandTheme();
    }, [brandName]);
    
    useEffect(() => {
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--primary', theme.primary);
            root.style.setProperty('--background', theme.background);
            root.style.setProperty('--accent', theme.accent);
            
            // Logic to handle dark mode if the theme is dark
            if (theme.name.includes('(Dark)')) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);


  return null; // This component only injects styles
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = /\/login|\/signup|\/forgot-password/.test(pathname);
  const isLandingPage = pathname === '/';
  const isGlobalPage = ['/', '/wishlist'].includes(pathname) || pathname.startsWith('/legal');
  
  const showHeader = !isAdminRoute && !isAuthRoute && !isGlobalPage;

  const getBrandName = () => {
    // These pages should use the default theme, not a brand-specific one.
    if (isAdminRoute || isGlobalPage || pathname === '/create-hamper') {
      return null;
    }
    
    // First, try to get from the path, e.g., /reeva/home
    const pathParts = pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] && pathParts[1] !== 'products') {
      return pathParts[1];
    }

    // If not in path, try to get from query param, e.g., /products/123?storefront=reeva
    const storefrontQuery = searchParams.get('storefront');
    if (storefrontQuery) {
        return storefrontQuery;
    }

    return null;
  }
  
  const brandName = getBrandName();

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
