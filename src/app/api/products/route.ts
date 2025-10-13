

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
    const brands = searchParams.get('brands');
    const colors = searchParams.get('colors');
    const keyword = searchParams.get('keyword');
    const keywords = searchParams.get('keywords'); // For similar products
    const exclude = searchParams.get('exclude'); // To exclude current product
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sortBy = searchParams.get('sortBy');

    let query: any = {};

    if (storefront) {
      query.storefront = storefront;
    }
    
    if (category) {
        query.category = { $in: category.split(',') };
    }

    if (brands) {
        query.brand = { $in: brands.split(',') };
    }

    if (colors) {
        query.color = { $in: colors.split(',') };
    }

    if (keyword) {
        // Search in name and keywords for a better search experience
        const regex = new RegExp(keyword, 'i');
        query.$or = [
            { name: regex },
            { keywords: { $in: [regex] } },
            { brand: regex },
            { category: regex }
        ];
    }

    if (keywords) {
        const keywordArray = keywords.split(',');
        query.$or = [
            { keywords: { $in: keywordArray.map(k => new RegExp(k, 'i')) } },
            { name: { $in: keywordArray.map(k => new RegExp(k, 'i')) } },
        ]
    }
    
    if (exclude) {
        query._id = { $ne: exclude };
    }

    let sortOptions: any = { createdAt: -1 };
    if (sortBy === 'popular') {
        query.stock = { $gt: 0 };
        // A simple popularity score. A real app might use orders or a more complex algorithm.
        sortOptions = { clicks: -1, views: -1 };
    } else if (sortBy === 'price-asc') {
        sortOptions = { sellingPrice: 1 };
    } else if (sortBy === 'price-desc') {
        sortOptions = { sellingPrice: -1 };
    } else if (sortBy === 'rating') {
        sortOptions = { rating: -1 };
    } else if (sortBy === 'newest') {
        sortOptions = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();


    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit
      }
    }, { status: 200 });

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

        if (!variants || variants.length === 0) {
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
