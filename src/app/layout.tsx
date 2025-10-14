
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
