
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
  const pathname = headersList.get('x-invoke-path') || '/';
  
  const { theme, settings } = await getThemeForRequest(pathname, '');
  const platformSettings = settings as IPlatformSettings | null;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = /\/(login|signup|forgot-password)/.test(pathname);
  const showHeaderAndFooter = !isAdminRoute && !isAuthRoute;

  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
        <head>
            {platformSettings?.platformFaviconUrl && (
                <link rel="icon" href={platformSettings.platformFaviconUrl} />
            )}
            <title>{platformSettings?.platformName || 'The Brand Cart'}</title>
            <ThemeInjector theme={theme} />
        </head>
        <body className={cn(
            "min-h-screen font-body antialiased no-scrollbar",
            showHeaderAndFooter && "flex flex-col"
        )}>
            <AuthProvider>
                {showHeaderAndFooter && <Header />}
                {children}
                {showHeaderAndFooter && <GlobalFooter />}
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
