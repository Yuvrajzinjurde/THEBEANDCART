

'use server';

import dbConnect from './mongodb';
import Product, { IProduct } from '@/models/product.model';
import { Types } from 'mongoose';

// Dummy data for variants
const variantColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold'];
const variantSizes = ['S', 'M', 'L', 'XL'];

/**
 * Updates all existing products to have multiple variants and categories.
 * This script is designed to be idempotent and non-destructive to other collections.
 */
export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Database connected, starting product update process...');

        const products = await Product.find({});
        
        if (products.length === 0) {
            const message = "No products found. Nothing to update.";
            console.log(message);
            return { success: true, message };
        }

        const bulkOps = [];
        let updatedCount = 0;

        for (const product of products) {
            // Check if the product already has a styleId, indicating it's part of a variant group.
            // If so, we'll skip it to avoid re-processing and creating duplicates.
            if (product.styleId) {
                continue;
            }

            // This is a new product or a standalone one, let's make it a "master" and create variants for it.
            const styleId = new Types.ObjectId().toHexString();
            const variantsToCreate = [];

            // Generate 3 to 5 variants
            const variantCount = Math.floor(Math.random() * 3) + 3;
            const usedColors = new Set<string>();

            for (let i = 0; i < variantCount; i++) {
                // Generate unique color for the variant
                let color: string;
                do {
                    color = variantColors[Math.floor(Math.random() * variantColors.length)];
                } while (usedColors.has(color));
                usedColors.add(color);

                const size = variantSizes[Math.floor(Math.random() * variantSizes.length)];
                const stock = Math.floor(Math.random() * 100);

                // Generate 5 unique placeholder images for each variant
                const images = Array.from({ length: 5 }, (_, j) => `https://picsum.photos/seed/${styleId}-${color}-${j}/600/600`);

                const variantName = `${product.name} - ${color}, ${size}`;

                // Convert existing single category to an array and add more
                const baseCategory = (Array.isArray(product.category) ? product.category[0] : product.category) as string;
                const newCategories = new Set([baseCategory, 'Featured', color]);

                variantsToCreate.push({
                    name: variantName,
                    description: product.description,
                    mrp: product.mrp,
                    sellingPrice: product.sellingPrice,
                    category: Array.from(newCategories),
                    images: images,
                    stock: stock,
                    rating: product.rating,
                    brand: product.brand,
                    storefront: product.storefront,
                    keywords: product.keywords,
                    returnPeriod: product.returnPeriod,
                    styleId: styleId,
                    color: color,
                    size: size,
                });
            }

            if (variantsToCreate.length > 0) {
                // Delete the original standalone product
                bulkOps.push({
                    deleteOne: {
                        filter: { _id: product._id }
                    }
                });

                // Insert the new variants
                for (const variant of variantsToCreate) {
                    bulkOps.push({
                        insertOne: {
                            document: variant
                        }
                    });
                }
                updatedCount++;
            }
        }
        
        if (bulkOps.length > 0) {
             await Product.bulkWrite(bulkOps);
             const message = `Successfully updated ${updatedCount} product groups with variants.`;
             console.log(message);
             return { success: true, message };
        } else {
            const message = "All products are already in variant groups. No updates needed.";
            console.log(message);
            return { success: true, message };
        }


    } catch (error: any) {
        console.error('Error during product seeding process:', error);
        throw new Error(`Failed to seed product variants: ${error.message}`);
    }
};
