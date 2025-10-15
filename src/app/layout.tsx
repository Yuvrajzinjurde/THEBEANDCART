
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'The Brand Cart',
  description: 'Your one-stop shop for amazing brands.',
  icons: {
    icon: '/favicon.ico',
  },
};


export default function RootLayout({
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
