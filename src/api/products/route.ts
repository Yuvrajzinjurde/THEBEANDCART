

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
    const keyword = searchParams.get('keyword');
    const keywords = searchParams.get('keywords'); // For similar products
    const exclude = searchParams.get('exclude'); // To exclude current product
    
    let query: any = {};

    if (storefront) {
      query.storefront = storefront;
    }
    
    if (category) {
        query.category = category;
    }

    if (keyword) {
        query.keywords = { $in: [new RegExp(keyword, 'i')] };
    }

    if (keywords) {
        const keywordArray = keywords.split(',');
        query.keywords = { $in: keywordArray.map(k => new RegExp(k, 'i')) };
    }
    
    if (exclude) {
        query._id = { $ne: exclude };
    }

    // If any filter is provided, use the query.
    if (storefront || category || keyword || keywords) {
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .lean();
        
        return NextResponse.json({ products }, { status: 200 });
    }

    // If no specific filter, fetch a few products from each brand for the main landing page or all products for hamper creation.
    const products = await Product.find({})
        .sort({ createdAt: -1 })
        .lean();


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
            // This is a single product without variants
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
            // Ensure top-level images are not passed to variant products
            images: variant.images,
        }));

        const newProducts = await Product.insertMany(productDocs);

        return NextResponse.json({ message: 'Product catalog created successfully', products: newProducts }, { status: 201 });

    } catch (error) {
        console.error('Failed to create product:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

