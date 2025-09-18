

'use server';

import dbConnect from './mongodb';
import Product from '@/models/product.model';
import { Types } from 'mongoose';

// Dummy data for variants
const variantColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold'];
const variantSizes = ['S', 'M', 'L', 'XL'];

// Base product templates
const productTemplates = [
    { name: 'Classic Leather Jacket', baseCategory: 'Apparel', brand: 'Reeva', storefront: 'reeva' },
    { name: 'Wireless Noise-Cancelling Headphones', baseCategory: 'Electronics', brand: 'Aura', storefront: 'aura' },
    { name: 'Organic Cotton Bath Towel Set', baseCategory: 'Home Goods', brand: 'Reeva', storefront: 'reeva' },
    { name: 'Stainless Steel Chronograph Watch', baseCategory: 'Accessories', brand: 'Aura', storefront: 'aura' },
    { name: 'Ethereal Diamond Necklace', baseCategory: 'Jewelry', brand: 'Reeva', storefront: 'reeva' },
];

/**
 * Clears the products collection and seeds it with new multi-variant products.
 * This script is idempotent by nature of clearing the collection first.
 */
export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Database connected, starting product seeding process...');

        // 1. Clear the existing products collection for a clean run
        console.log('Clearing existing products collection...');
        await Product.deleteMany({});
        console.log('Products collection cleared.');

        const productsToCreate = [];

        // 2. Iterate through templates to create new product groups
        for (const template of productTemplates) {
            const styleId = new Types.ObjectId().toHexString();
            
            // Generate 3 to 5 variants for each template
            const variantCount = Math.floor(Math.random() * 3) + 3;
            const usedColors = new Set<string>();

            for (let i = 0; i < variantCount; i++) {
                // Generate a unique color for the variant
                let color: string;
                do {
                    color = variantColors[Math.floor(Math.random() * variantColors.length)];
                } while (usedColors.has(color));
                usedColors.add(color);

                const size = variantSizes[Math.floor(Math.random() * variantSizes.length)];
                const stock = Math.floor(Math.random() * 100) + 10; // 10 to 110
                const mrp = (Math.floor(Math.random() * 100) + 50) * 100;
                const sellingPrice = Math.floor(mrp * (0.8 - Math.random() * 0.2)); // 10-30% discount
                const rating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0

                // Generate 5 unique placeholder images for each variant
                const images = Array.from({ length: 5 }, (_, j) => `https://picsum.photos/seed/${styleId}-${color}-${j}/600/600`);

                const variantName = `${template.name} - ${color}, ${size}`;

                // Create multiple categories
                const categories = Array.from(new Set([template.baseCategory, color, template.brand]));

                productsToCreate.push({
                    name: variantName,
                    description: `A high-quality ${variantName}, perfect for any occasion. Made with the finest materials.`,
                    mrp: mrp,
                    sellingPrice: sellingPrice,
                    category: categories,
                    images: images,
                    stock: stock,
                    rating: parseFloat(rating.toFixed(1)),
                    brand: template.brand,
                    storefront: template.storefront,
                    keywords: [template.baseCategory, color],
                    returnPeriod: 15,
                    styleId: styleId,
                    color: color,
                    size: size,
                    views: Math.floor(Math.random() * 500),
                    clicks: Math.floor(Math.random() * 50),
                });
            }
        }
        
        if (productsToCreate.length > 0) {
             await Product.insertMany(productsToCreate);
             const message = `Successfully seeded database with ${productsToCreate.length} new product variants.`;
             console.log(message);
             return { success: true, message };
        } else {
            const message = "No products were generated to seed.";
            console.log(message);
            return { success: false, message };
        }

    } catch (error: any) {
        console.error('Error during product seeding process:', error);
        throw new Error(`Failed to seed products: ${error.message}`);
    }
};

