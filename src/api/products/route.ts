
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import { ProductFormSchema } from '@/lib/product-schema';
import { Types } from 'mongoose';


export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const storefront = searchParams.get('storefront');
    const category = searchParams.get('category');
    
    let query: any = {};

    if (storefront) {
      query.storefront = storefront;
    }
    
    if (category) {
        query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50)
      .lean(); // Use .lean() to get plain JS objects

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        const validation = ProductFormSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { variants, ...commonData } = validation.data;
        const styleId = new Types.ObjectId().toHexString();

        if (variants.length === 0) {
            // This is a single product, not a catalog
            const productData = { ...commonData, styleId };
            const newProduct = new Product(productData);
            await newProduct.save();
            return NextResponse.json({ message: 'Product created successfully', products: [newProduct] }, { status: 201 });
        }

        // This is a catalog with multiple variants
        const productDocs = variants.map(variant => ({
            ...commonData,
            ...variant,
            styleId,
            name: `${commonData.name} - ${variant.color || ''} ${variant.size || ''}`.trim(),
        }));

        const newProducts = await Product.insertMany(productDocs);

        return NextResponse.json({ message: 'Product catalog created successfully', products: newProducts }, { status: 201 });

    } catch (error) {
        console.error('Failed to create product:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
