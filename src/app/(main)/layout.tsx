
import { headers } from 'next/headers';
import { getThemeForRequest } from '@/lib/theme';
import type { IPlatformSettings } from '@/models/platform.model';
import Header from '@/components/header';
import { GlobalFooter } from '@/components/global-footer';

// This is the new layout specifically for the main site pages.
// It contains the Header and Footer.

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

export default async function MainSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '/';
  
  const { theme, settings } = await getThemeForRequest(pathname, '');
  const platformSettings = settings as IPlatformSettings | null;

  const authRoutes = ['/login', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname.endsWith(route));
  
  return (
    <>
        <head>
            {platformSettings?.platformFaviconUrl && (
                <link rel="icon" href={platformSettings.platformFaviconUrl} />
            )}
            <title>{platformSettings?.platformName || 'The Brand Cart'}</title>
            <ThemeInjector theme={theme} />
        </head>
        {!isAuthRoute && <Header />}
        <div className="flex-1 w-full flex flex-col">
            {children}
        </div>
        {!isAuthRoute && <GlobalFooter />}
    </>
  );
}
