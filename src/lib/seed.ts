
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
        console.log('Connected to the database, starting category update for all brands...');

        const brands = await Brand.find({});
        if (brands.length === 0) {
            const message = 'No brands found in the database to update.';
            console.log(message);
            return { success: true, message };
        }

        let updatedCount = 0;

        for (const brand of brands) {
            const currentCategories = new Set(brand.categories || []);
            const initialSize = currentCategories.size;

            staticCategories.forEach(cat => {
                currentCategories.add(cat);
            });
            
            // Only save if there were actual changes.
            if (currentCategories.size > initialSize) {
                brand.categories = Array.from(currentCategories).sort();
                await brand.save();
                updatedCount++;
                console.log(`Successfully updated categories for brand: ${brand.displayName}`);
            }
        }
        
        const message = updatedCount > 0 
            ? `${updatedCount} brand(s) have been successfully updated with the full category list.`
            : 'All brands already had the complete category list. No updates were necessary.';

        console.log(`Update complete. ${message}`);

        return { 
            success: true, 
            message: message,
            updatedCount: updatedCount,
        };

    } catch (error: any) {
        console.error('Error updating brand categories:', error);
        // Ensure an error is thrown so the frontend can catch it.
        throw new Error('Failed to update brand categories in the database.');
    }
};
