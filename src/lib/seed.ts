
'use server';

import dbConnect from './mongodb';
import Brand from '@/models/brand.model';

const staticCategories = [
    'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Kurtas', 'Sarees', 'Dresses', 
    'Skirts', 'Heels', 'Flats', 'Sneakers', 'Boots', 'Handbags', 'Wallets', 
    'Belts', 'Sunglasses', 'Watches', 'Rings', 'Earrings', 'Necklaces', 
    'Bracelets', 'Moisturizers', 'Sunscreens', 'Face Washes', 'Serums', 
    'Lipsticks', 'Foundations', 'Eyeshadows', 'Combos', 'Corrugated Boxes'
];


export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Connected to the database, checking brands for category updates...');

        const brands = await Brand.find({});
        let updatedCount = 0;

        for (const brand of brands) {
            const existingCategories = new Set(brand.categories || []);
            const initialSize = existingCategories.size;

            staticCategories.forEach(cat => existingCategories.add(cat));
            
            if (existingCategories.size > initialSize) {
                brand.categories = Array.from(existingCategories).sort();
                await brand.save();
                updatedCount++;
                console.log(`Updated categories for brand: ${brand.displayName}`);
            }
        }
        
        const message = updatedCount > 0 
            ? `${updatedCount} brand(s) have been updated with the full category list.`
            : 'All brands already had the complete category list. No updates were necessary.';

        console.log(`Update complete. ${message}`);

        return { 
            success: true, 
            message: message
        };

    } catch (error: any) {
        console.error('Error updating brand categories:', error);
        throw new Error('Failed to update brand categories in the database.');
    }
};
