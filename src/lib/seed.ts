
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
        console.log('Connected to the database, updating brands...');

        const result = await Brand.updateMany(
            { 
                $or: [
                    { categories: { $exists: false } },
                    { categories: { $size: 0 } }
                ] 
            },
            { 
                $set: { categories: staticCategories } 
            }
        );

        console.log(`Brands update result: ${result.matchedCount} matched, ${result.modifiedCount} modified.`);

        if (result.modifiedCount > 0) {
            return { 
                success: true, 
                message: `${result.modifiedCount} brand(s) have been updated with the default category list.` 
            };
        } else {
             return { 
                success: true, 
                message: 'All brands already had categories. No updates were necessary.' 
            };
        }

    } catch (error: any) {
        console.error('Error updating brand categories:', error);
        throw new Error('Failed to update brand categories in the database.');
    }
};

