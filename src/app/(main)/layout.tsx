
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import Header from '@/components/header';
import { GlobalFooter } from '@/components/global-footer';


export default async function MainSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '/';
  
  const authRoutes = ['/login', '/signup', '/forgot-password'];
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = authRoutes.some(route => pathname.endsWith(route));
  
  const showHeaderAndFooter = !isAdminRoute && !isAuthRoute;

  return (
    <>
        {showHeaderAndFooter && <Header />}
        <div className="flex-1 w-full flex flex-col">
            {children}
        </div>
        {showHeaderAndFooter && <GlobalFooter />}
    </>
  );
}
