
import type { IBrand } from '@/models/brand.model';
import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import PlatformSettings from '@/models/platform.model';
import { themeColors } from './brand-schema';

<<<<<<< HEAD
const getBrand = async (brandName: string): Promise<IBrand | null> => {
=======
// This file is no longer used for server-side theme determination in the layout,
// but the functions can be useful for other server components if needed.

const getBrand = cache(async (brandName: string): Promise<IBrand | null> => {
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
    await dbConnect();
    const brand = await Brand.findOne({ permanentName: { $regex: new RegExp(`^${brandName}$`, 'i') } }).lean();
    return brand ? JSON.parse(JSON.stringify(brand)) : null;
};

const getPlatformSettings = async () => {
    await dbConnect();
    const settings = await PlatformSettings.findOne({}).lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
};


export async function getThemeForRequest(pathname: string, search: string) {
<<<<<<< HEAD
    let theme: any;
    const searchParams = new URLSearchParams(search);
=======
    let themeName: string | undefined;
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
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
            if (brand && brand.theme) {
                // This correctly sets the theme for specific brand storefronts
                theme = { ...brand.theme, name: brand.themeName };
            }
        } catch (error) {
            console.error(`Failed to fetch theme for brand "${brandName}"`, error);
        }
    }

    // If no brand-specific theme is found, or it's a global route, fall back to platform settings
    if (!theme) {
        if (settings && settings.platformThemeName) {
             const foundTheme = themeColors.find(t => t.name === settings.platformThemeName);
             if (foundTheme) {
                theme = foundTheme;
             }
        }
        
        // If still no theme, use the hardcoded default
        if (!theme) {
            theme = {
                name: 'Blue',
                primary: '217.2 91.2% 59.8%',
                background: '0 0% 100%',
                accent: '210 40% 96.1%'
            };
        }
    }
    
<<<<<<< HEAD
    return { theme, settings };
=======
    const theme = themeColors.find(t => t.name === themeName) || themeColors.find(t => t.name === 'Blue');
    
    return { theme, settings, isBrandRoute };
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
}
