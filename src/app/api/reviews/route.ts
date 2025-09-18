
'use server';

import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import Product from '@/models/product.model';
import Order from '@/models/order.model';
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
    
    const product = await Product.findById(productObjectId, 'styleId');
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Find all variants to check for existing reviews and for purchase validation
    const variantIds = product.styleId 
        ? (await Product.find({ styleId: product.styleId }, '_id')).map(p => p._id)
        : [productObjectId];

    const existingReview = await Review.findOne({ productId: { $in: variantIds }, userId });
    if (existingReview) {
        return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 409 });
    }
    
    const hasPurchased = await Order.findOne({
      userId,
      'products.productId': { $in: variantIds },
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

    // After saving, recalculate average rating for all variants
    const stats = await Review.aggregate([
        { $match: { productId: { $in: variantIds } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    if (stats.length > 0) {
        const newAverageRating = stats[0].avgRating;
        // Update all variants with the new average rating
        await Product.updateMany(
            { _id: { $in: variantIds } },
            { $set: { rating: newAverageRating } }
        );
    }

    return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

  } catch (error) {
    console.error('Review Submission Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
