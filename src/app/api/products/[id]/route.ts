
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: 'Invalid product ID format' }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
