
'use server';

import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
  name: string;
}

const ReviewSubmissionSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val)),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(1, "Review text cannot be empty."),
  images: z.array(z.string().url()).optional(),
});


export async function POST(req: Request) {
  try {
    await dbConnect();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwtDecode<DecodedToken>(token);
    const userId = new Types.ObjectId(decoded.userId);
    const userName = decoded.name;

    const body = await req.json();
    const validation = ReviewSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { productId, rating, reviewText, images } = validation.data;
    const productObjectId = new Types.ObjectId(productId);
    
    // Check if product exists
    const product = await Product.findById(productObjectId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ productId: productObjectId, userId });
    if (existingReview) {
        return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 409 });
    }
    
    const newReview = new Review({
        productId: productObjectId,
        userId,
        userName,
        rating,
        review: reviewText, // 'review' is the field name in the schema
        images,
    });

    await newReview.save();

    // Update product's average rating
    const stats = await Review.aggregate([
        { $match: { productId: productObjectId } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productObjectId, { rating: stats[0].avgRating });
    }

    return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

  } catch (error) {
    console.error('Review Submission Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
