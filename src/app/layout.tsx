
"use client";

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import Header from '@/components/header';
import { usePathname } from 'next/navigation';
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
  const isNonAdminRoute = !pathname.startsWith('/admin');
  
  // More specific check for auth routes
  const isAuthRoute = /\/login|\/signup|\/forgot-password/.test(pathname);
  
  const brandName = isNonAdminRoute && pathname.split('/')[1] ? pathname.split('/[brand]')[0].split('/')[1] : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <ThemeInjector brandName={brandName} />
      </head>
      <body className="flex min-h-screen flex-col font-body antialiased">
        <AuthProvider>
          {isNonAdminRoute && !isAuthRoute && <Header />}
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
