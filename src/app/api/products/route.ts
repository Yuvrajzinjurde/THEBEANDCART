
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');

    const query = brand ? { brand } : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to 50 products

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
