
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// This is the new, clean root layout that applies to ALL routes.
// It does NOT contain the main header or footer.

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
