
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');

    const query: any = {};
    if (brand && brand !== 'null' && brand !== 'undefined') {
        query.storefront = brand;
    }
    
    // Use distinct to get unique category values directly from the database
    const categories = await Product.distinct('category', query);

    return NextResponse.json({ categories }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
