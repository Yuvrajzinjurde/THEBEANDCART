
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import { Types } from 'mongoose';


export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
    try {
        await dbConnect();

        const { productId } = params;
        if (!Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
        }

        const reviews = await Review.find({ productId }).sort({ likes: -1 }).limit(10);

        return NextResponse.json({ reviews }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
