
import type { IBrand } from '@/models/brand.model';
import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import PlatformSettings from '@/models/platform.model';

const getBrand = async (brandName: string): Promise<IBrand | null> => {
    await dbConnect();
    const brand = await Brand.findOne({ permanentName: brandName }).lean();
    return brand ? JSON.parse(JSON.stringify(brand)) : null;
};

const getPlatformSettings = async () => {
    await dbConnect();
    const settings = await PlatformSettings.findOne({}).lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
};


export async function getThemeForRequest(pathname: string, search: string) {
    let theme: any;
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
                theme = { ...brand.theme, name: brand.themeName };
            }
        } catch (error) {
            console.error(`Failed to fetch theme for brand "${brandName}"`, error);
        }
    }

    if (!theme) {
        theme = settings?.theme || {
            name: 'Blue',
            primary: '217.2 91.2% 59.8%',
            background: '0 0% 100%',
            accent: '210 40% 96.1%'
        };
    }
    
    return { theme, settings };
}
