
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import { GlobalFooter } from '@/components/global-footer';

function ThemeInjector({ theme }: { theme: any }) {
    if (!theme) return null;

    const styles = `
    :root {
        --primary: ${theme.primary};
        --background: ${theme.background};
        --accent: ${theme.accent};
    }
    ${theme.name.includes('(Dark)') ? '.dark {}' : ''}
    `;

    return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '';
  const searchParams = headersList.get('x-next-search') || '';

  const { theme, settings } = await getThemeForRequest(pathname, searchParams);
  const platformSettings = settings as IPlatformSettings | null;
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isBrandRoute = !isAdminRoute && !pathname.startsWith('/legal') && !pathname.startsWith('/wishlist') && !pathname.startsWith('/cart') && !pathname.startsWith('/search') && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/forgot-password') && pathname !== '/' && !pathname.startsWith('/create-hamper');
  const isAuthRoute = ['/login', '/signup', '/forgot-password'].some(route => pathname.includes(route));


  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
        <head>
            {platformSettings?.platformFaviconUrl && (
                <link rel="icon" href={platformSettings.platformFaviconUrl} />
            )}
            <title>{platformSettings?.platformName || 'The Brand Cart'}</title>
            <ThemeInjector theme={theme} />
        </head>
        <body className={cn("flex min-h-screen flex-col font-body antialiased no-scrollbar")}>
            <AuthProvider>
                {!isAdminRoute && <Header />}
                <div className="flex-1 flex flex-col">{children}</div>
                {!isAdminRoute && !isBrandRoute && !isAuthRoute && <GlobalFooter />}
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
