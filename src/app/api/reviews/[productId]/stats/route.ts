
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import { Types } from 'mongoose';

export interface ReviewStats {
    totalRatings: number;
    totalReviews: number;
    averageRating: number;
}

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

        const stats = await Review.aggregate([
            { $match: { productId: new Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$productId',
                    totalRatings: { $sum: 1 }, // Count every document as a rating
                    totalReviews: { 
                        $sum: { 
                            $cond: [{ $ne: ["$review", ""] }, 1, 0] 
                        } 
                    }, // Count only if review text exists
                    averageRating: { $avg: '$rating' },
                }
            }
        ]);
        
        if (stats.length > 0) {
            const { totalRatings, totalReviews, averageRating } = stats[0];
            return NextResponse.json({ totalRatings, totalReviews, averageRating }, { status: 200 });
        } else {
            // No reviews found, return zero stats
            return NextResponse.json({ totalRatings: 0, totalReviews: 0, averageRating: 0 }, { status: 200 });
        }
    } catch (error) {
        console.error('Failed to fetch review stats:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
