
import { themeColors } from '@/lib/brand-schema';
import type { IBrand } from '@/models/brand.model';
import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import PlatformSettings from '@/models/platform.model';
import { cache } from 'react';

// Wrap database calls in React's cache to prevent re-fetching on the same request
const getBrand = cache(async (brandName: string): Promise<IBrand | null> => {
    await dbConnect();
    // Use a case-insensitive regex to find the brand, which is more robust.
    const brand = await Brand.findOne({ permanentName: { $regex: new RegExp(`^${brandName}$`, 'i') } }).lean();
    return brand ? JSON.parse(JSON.stringify(brand)) : null;
});

const getPlatformSettings = cache(async () => {
    await dbConnect();
    const settings = await PlatformSettings.findOne({}).lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
});


export async function getThemeForRequest(pathname: string, search: string) {
    let themeName: string | undefined;
    const settings = await getPlatformSettings();
    let brandName: string | null = null;
    let isBrandRoute = false;

    const pathParts = pathname.split('/').filter(p => p);

    const globalPrefixes = [
      'admin', 'legal', 'wishlist', 'cart', 'search',
      'login', 'signup', 'forgot-password', 'dashboard', 'create-hamper'
    ];
    
    if (pathParts.length > 0 && !globalPrefixes.includes(pathParts[0])) {
      brandName = pathParts[0];
      isBrandRoute = true;
    }
    
    if (isBrandRoute && brandName) {
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
    
    const theme = themeColors.find(t => t.name === themeName) || themeColors.find(t => t.name === 'Blue');
    
    return { theme, settings, isBrandRoute };
}
