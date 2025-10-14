
'use server';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
}

const getAuthFromToken = (req: Request): DecodedToken | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function POST(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    await dbConnect();
    
    const auth = getAuthFromToken(req);
    if (!auth) {
        return NextResponse.json({ message: 'Authentication required to like a review.' }, { status: 401 });
    }

    const { reviewId } = params;
    if (!Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ message: 'Invalid Review ID' }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review liked successfully', review }, { status: 200 });
  } catch (error) {
    console.error('Failed to like review:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
