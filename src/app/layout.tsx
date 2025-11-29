
import './globals.css';
<<<<<<< HEAD
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import { WhatsAppSupport } from '@/components/whatsapp-support';
=======
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

export const metadata: Metadata = {
  title: 'The Brand Cart',
  description: 'Your one-stop shop for amazing brands.',
  icons: {
    icon: '/favicon.ico',
  },
};

<<<<<<< HEAD
    const styles = `
    :root {
        --primary: ${theme.primary};
        --background: ${theme.background};
        --accent: ${theme.accent};
    }
    ${theme.name && theme.name.includes('(Dark)') ? '.dark {}' : ''}
    `;
=======
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
<<<<<<< HEAD
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '';
  const searchParams = headersList.get('x-next-search') || '';

  const { theme, settings } = await getThemeForRequest(pathname, searchParams);
  const platformSettings = settings as IPlatformSettings | null;

  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
        <head>
            {platformSettings?.platformFaviconUrl && (
                <link rel="icon" href={platformSettings.platformFaviconUrl} sizes="any" />
            )}
            <title>{platformSettings?.platformName || 'Brand Cart'}</title>
            <ThemeInjector theme={theme} />
        </head>
        <body className={cn("flex min-h-screen flex-col font-body antialiased no-scrollbar")}>
            <Providers>
                {children}
                <WhatsAppSupport />
            </Providers>
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
=======

  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
        <head />
        <body className={cn(
            "min-h-screen font-body antialiased no-scrollbar",
            "flex flex-col"
        )}>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster position="top-right" />
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
        </body>
    </html>
  );
}
