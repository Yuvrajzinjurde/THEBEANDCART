
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import Header from '@/components/header';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // We will handle the layout for admin routes separately.
  const isNonAdminRoute = !pathname.startsWith('/admin');
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col font-body antialiased">
        <AuthProvider>
          {isNonAdminRoute && <Header />}
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
