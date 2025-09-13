
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const products = await Product.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to 50 products for the main page

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
