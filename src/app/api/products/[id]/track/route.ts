
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import { Types } from 'mongoose';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const { metric } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    if (metric !== 'views' && metric !== 'clicks') {
      return NextResponse.json({ message: 'Invalid metric' }, { status: 400 });
    }

    const update = { $inc: { [metric]: 1 } };
    
    await Product.findByIdAndUpdate(id, update);

    return NextResponse.json({ message: `Metric '${metric}' updated successfully` }, { status: 200 });
  } catch (error) {
    console.error('Failed to track metric:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
