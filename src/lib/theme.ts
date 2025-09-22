
import { themeColors } from '@/lib/brand-schema';
import type { IBrand } from '@/models/brand.model';
import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import PlatformSettings from '@/models/platform.model';
import { cache } from 'react';

// Wrap database calls in React's cache to prevent re-fetching on the same request
const getBrand = cache(async (brandName: string): Promise<IBrand | null> => {
    await dbConnect();
    const brand = await Brand.findOne({ permanentName: brandName }).lean();
    return brand ? JSON.parse(JSON.stringify(brand)) : null;
});

const getPlatformSettings = cache(async () => {
    await dbConnect();
    const settings = await PlatformSettings.findOne({}).lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
});


export async function getThemeForRequest(pathname: string, search: string) {
    let themeName: string | undefined;
    const searchParams = new URLSearchParams(search);
    const settings = await getPlatformSettings();

    const globalRoutes = ['/admin', '/legal', '/wishlist', '/create-hamper', '/cart', '/search'];
    const isGlobalRoute = pathname === '/' || globalRoutes.some(route => pathname.startsWith(route));

    let brandName: string | null = null;
    
    if (!isGlobalRoute) {
        if (pathname.startsWith('/products/')) {
            brandName = searchParams.get('storefront');
        } else {
            const pathParts = pathname.split('/');
            if (pathParts.length > 1 && pathParts[1]) {
                brandName = pathParts[1];
            }
        }
    }
    
    if (brandName) {
        try {
            const brand = await getBrand(brandName);
            if (brand) {
                themeName = brand.themeName;
            }
        } catch (error) {
            console.error(`Failed to fetch theme for brand "${brandName}"`, error);
        }
    }

    if (!themeName) {
        themeName = settings?.platformThemeName || 'Blue';
    }
    
    const theme = themeColors.find(t => t.name === themeName) || themeColors.find(t => t.name === 'Blue') || themeColors[0];
    
    return { theme, settings };
}
