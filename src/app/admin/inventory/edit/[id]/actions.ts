
'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import type { IProduct } from '@/models/product.model';

export async function getProductById(productId: string): Promise<IProduct> {
    await dbConnect();
    try {
        const product = await Product.findById(productId).lean();
        
        if (!product) {
            throw new Error('Product not found.');
        }

        return JSON.parse(JSON.stringify(product));

    } catch (error) {
        console.error(`Failed to fetch product by ID ${productId}:`, error);
        throw new Error('Could not fetch product from the database.');
    }
}

export async function getVariantsByStyleId(styleId: string): Promise<IProduct[]> {
    await dbConnect();
    try {
        const variants = await Product.find({ styleId }).lean();
        return JSON.parse(JSON.stringify(variants));
    } catch (error) {
        console.error(`Failed to fetch variants for style ID ${styleId}:`, error);
        throw new Error('Could not fetch product variants from the database.');
    }
}
