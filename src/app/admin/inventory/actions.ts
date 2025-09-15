
'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import type { IProduct } from '@/models/product.model';

export async function getProductsByBrand(brand: string): Promise<IProduct[]> {
    await dbConnect();
    try {
        const query = brand === 'All Brands' ? {} : { storefront: brand };
        const products = await Product.find(query).sort({ createdAt: -1 }).lean();
        
        // Mongoose returns objects that are not plain JS objects.
        // We need to convert them to plain objects to pass them to client components.
        return JSON.parse(JSON.stringify(products));

    } catch (error) {
        console.error('Failed to fetch products by brand:', error);
        throw new Error('Could not fetch products from the database.');
    }
}
