
'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import Product from '@/models/product.model';
import Order from '@/models/order.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  name: string;
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

const ReviewSubmissionSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val)),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(1, "Review text cannot be empty."),
  images: z.array(z.string().url()).optional(),
});


export async function POST(req: Request) {
  try {
    await dbConnect();

    const auth = getAuthFromToken(req);
    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = new Types.ObjectId(auth.userId);
    const userName = auth.name;

    const body = await req.json();
    const validation = ReviewSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { productId, rating, reviewText, images } = validation.data;
    const productObjectId = new Types.ObjectId(productId);
    
    const product = await Product.findById(productObjectId, 'styleId');
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Get all variant IDs that share the same styleId, or just the product's own ID
    const productIdsForCheck = product.styleId 
        ? (await Product.find({ styleId: product.styleId }, '_id')).map(p => p._id)
        : [productObjectId];

    const existingReview = await Review.findOne({ productId: { $in: productIdsForCheck }, userId });
    if (existingReview) {
        return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 409 });
    }
    
    const hasPurchased = await Order.findOne({
      userId,
      'products.productId': { $in: productIdsForCheck },
      status: 'delivered'
    });

    if (!hasPurchased) {
      return NextResponse.json({ message: "You can only review products you've purchased and received." }, { status: 403 });
    }

    const newReview = new Review({
        productId: productObjectId, // Associate review with the specific variant purchased
        userId,
        userName,
        rating,
        review: reviewText,
        images,
    });

    await newReview.save();

    // Recalculate average rating for all products sharing the styleId
    const stats = await Review.aggregate([
        { $match: { productId: { $in: productIdsForCheck } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    if (stats.length > 0) {
        const newAverageRating = stats[0].avgRating;
        await Product.updateMany(
            { _id: { $in: productIdsForCheck } },
            { $set: { rating: newAverageRating } }
        );
    }

    return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

  } catch (error) {
    console.error('Review Submission Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
