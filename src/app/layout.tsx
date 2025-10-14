
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import type { Metadata } from 'next';


export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '/';
  // Note: getThemeForRequest is now simplified and primarily gets settings.
  const { settings } = await getThemeForRequest(pathname, '');
  const platformSettings = settings as IPlatformSettings | null;

  return {
    title: platformSettings?.platformName || 'AuthFlow',
    description: platformSettings?.platformDescription || 'Secure and easy authentication flow.',
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
  const search = headersList.get('x-invoke-query') || '';
  const { theme } = await getThemeForRequest(pathname, search);

  const themeVariables = `
    :root {
      --background: ${theme?.background || '0 0% 100%'};
      --foreground: ${theme?.name === 'Slate (Dark)' ? '210 20% 98%' : '222.2 84% 4.9%'};
      --card: ${theme?.background || '0 0% 100%'};
      --card-foreground: ${theme?.name === 'Slate (Dark)' ? '210 20% 98%' : '222.2 84% 4.9%'};
      --popover: ${theme?.background || '0 0% 100%'};
      --popover-foreground: ${theme?.name === 'Slate (Dark)' ? '210 20% 98%' : '222.2 84% 4.9%'};
      --primary: ${theme?.primary || '175 75% 40%'};
      --primary-foreground: ${theme?.name === 'Slate (Dark)' ? '210 20% 98%' : '210 40% 98%'};
      --secondary: ${theme?.accent || '210 40% 96.1%'};
      --secondary-foreground: ${theme?.name === 'Slate (Dark)' ? '210 20% 98%' : '222.2 47.4% 11.2%'};
      --muted: ${theme?.accent || '210 40% 96.1%'};
      --muted-foreground: ${theme?.name === 'Slate (Dark)' ? '217.9 15.8% 65.1%' : '215.4 16.3% 46.9%'};
      --accent: ${theme?.accent || '175 50% 95%'};
      --accent-foreground: ${theme?.name === 'Slate (Dark)' ? '210 20% 98%' : '222.2 47.4% 11.2%'};
      --border: ${theme?.name === 'Slate (Dark)' ? '215 27.9% 16.9%' : '214.3 31.8% 91.4%'};
      --input: ${theme?.name === 'Slate (Dark)' ? '215 27.9% 16.9%' : '214.3 31.8% 91.4%'};
      --ring: ${theme?.name === 'Slate (Dark)' ? '243.8 51.5% 46.9%' : '222.2 84% 4.9%'};
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
        <head>
          <style dangerouslySetInnerHTML={{ __html: themeVariables }} />
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
