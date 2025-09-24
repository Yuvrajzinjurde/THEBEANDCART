

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import { cn } from '@/lib/utils';

function ThemeInjector({ theme }: { theme: any }) {
    if (!theme) return null;

    const styles = `
    :root {
        --primary: ${theme.primary};
        --background: ${theme.background};
        --accent: ${theme.accent};
    }
    ${theme.name && theme.name.includes('(Dark)') ? '.dark {}' : ''}
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
            <AuthProvider>
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
