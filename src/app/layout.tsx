
"use client";

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import Header from '@/components/header';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const themeColors: Record<string, { primary: string; background: string; accent: string; }> = {
    'Blue': { primary: '217.2 91.2% 59.8%', background: '0 0% 100%', accent: '210 40% 96.1%' },
    'Green': { primary: '142.1 76.2% 36.3%', background: '0 0% 100%', accent: '145 63.4% 92.5%' },
    'Orange': { primary: '24.6 95% 53.1%', background: '0 0% 100%', accent: '20 92.3% 93.5%' },
    'Purple': { primary: '262.1 83.3% 57.8%', background: '0 0% 100%', accent: '260 100% 96.7%' },
    'Teal': { primary: '175 75% 40%', background: '0 0% 100%', accent: '175 50% 95%' },
    'Rose': { primary: '346.8 77.2% 49.8%', background: '0 0% 100%', accent: '350 100% 96.9%' },
    'Yellow': { primary: '47.9 95.8% 53.1%', background: '0 0% 100%', accent: '50 100% 96.1%' },
    'Slate (Dark)': { primary: '215.2 79.8% 52%', background: '222.2 84% 4.9%', accent: '217.2 32.6% 17.5%' },
    'Red': { primary: '0 72.2% 50.6%', background: '0 0% 100%', accent: '0 85.7% 95.9%' },
    'Magenta': { primary: '310 75% 50%', background: '0 0% 100%', accent: '310 50% 95%' },
     // Default theme
    'Default': { primary: '217.2 91.2% 59.8%', background: '0 0% 100%', accent: '210 40% 96.1%' },
};


function ThemeInjector({ brandName }: { brandName: string | null }) {
    const [theme, setTheme] = useState(themeColors.Default);

    useEffect(() => {
        async function fetchBrandTheme() {
            if (!brandName || brandName === 'admin') {
                 setTheme(themeColors.Default);
                 return;
            }
            try {
                const res = await fetch(`/api/brands/${brandName}`);
                if (res.ok) {
                    const { brand } = await res.json();
                    const selectedTheme = themeColors[brand.themeName as keyof typeof themeColors] || themeColors.Default;
                    setTheme(selectedTheme);
                }
            } catch (error) {
                console.error("Failed to fetch brand theme", error);
                setTheme(themeColors.Default);
            }
        }
        fetchBrandTheme();
    }, [brandName]);

    const cssVariables = `
    :root {
      --primary: ${theme.primary};
      --background: ${theme.background};
      --accent: ${theme.accent};
    }
  `;

  // For dark mode, you might want a different logic or fixed dark theme
  // This example just uses the same colors for simplicity.

  return <style>{cssVariables}</style>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isNonAdminRoute = !pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  
  const brandName = isNonAdminRoute && pathname.split('/')[1] ? pathname.split('/')[1] : null;

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


    