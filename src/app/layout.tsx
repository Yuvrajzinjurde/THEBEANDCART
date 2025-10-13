
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import type { Metadata } from 'next';


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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '/';
  const { settings } = await getThemeForRequest(pathname, '');
  const platformSettings = settings as IPlatformSettings | null;

  return {
    title: platformSettings?.platformName || 'The Brand Cart',
    icons: {
      icon: platformSettings?.platformFaviconUrl || '/favicon.ico',
    },
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '/';
  const { theme } = await getThemeForRequest(pathname, '');

  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
        <head>
           <ThemeInjector theme={theme} />
        </head>
        <body className={cn(
            "min-h-screen font-body antialiased no-scrollbar",
            "flex flex-col"
        )}>
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
