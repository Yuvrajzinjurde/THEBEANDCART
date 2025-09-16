
'use server';

import dbConnect from './mongodb';
import Brand from '@/models/brand.model';

// The full list of categories to be inserted if a brand has none.
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
        console.log('Connected to the database, checking for brands to update...');

        const brandreeva = await Brand.findById("68c6abc757b323aaf9876730")
        if (brandreeva && (!brandreeva.categories || brandreeva.categories.length === 0)) {
            brandreeva.categories.push(...staticCategories)
            await brandreeva.save()
            console.log('Updating reeva brand categories...');
        }

        const brandNeverMore = await Brand.findById("68c6c83657b323aaf9876787")
        if (brandNeverMore && (!brandNeverMore.categories || brandNeverMore.categories.length === 0)) {
            brandNeverMore.categories.push(...staticCategories)
            await brandNeverMore.save()
            console.log('Updating nevermore brand categories...');
        }
        
        const brandsToUpdate = await Brand.find({
            $or: [
                { categories: { $exists: false } },
                { categories: { $size: 0 } }
            ]
        });

        let modifiedCount = 0;
        for (const brand of brandsToUpdate) {
            brand.categories = staticCategories;
            await brand.save();
            modifiedCount++;
        }
        
        const message = modifiedCount > 0 
            ? `${modifiedCount} brand(s) have been updated with the default category list.`
            : 'All brands already had categories. No updates were necessary.';

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

