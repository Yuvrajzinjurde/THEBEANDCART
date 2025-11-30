
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';

// GET all variants for a given styleId
export async function GET(
  req: Request,
  { params }: { params: { styleId: string } }
) {
  try {
    await dbConnect();
    const { styleId } = params;

    if (!styleId) {
      return NextResponse.json({ message: 'Style ID is required' }, { status: 400 });
    }

    const variants = await Product.find({ styleId }).lean();

    if (!variants || variants.length === 0) {
      return NextResponse.json({ message: 'No variants found for this style' }, { status: 404 });
    }

    return NextResponse.json({ variants }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch variants:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
