
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import { GlobalFooter } from '@/components/global-footer';

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authRoutes = ['/login', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  const showFooter = !isAuthRoute;

  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      {showFooter && <GlobalFooter />}
    </>
  );
}
