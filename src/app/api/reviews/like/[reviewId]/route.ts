
'use server';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import { Types } from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    await dbConnect();

    const { reviewId } = params;
    if (!Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ message: 'Invalid Review ID' }, { status: 400 });
    }

    // A simple POST to this endpoint increments the like. No user tracking for simplicity.
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
