
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import Product from '@/models/product.model';
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
        
        // Find the product to get its styleId
        const currentProduct = await Product.findById(productId, 'styleId');
        if (!currentProduct || !currentProduct.styleId) {
            // Fallback for products without variants - just use its own ID
            const stats = await getStatsForProductIds([new Types.ObjectId(productId)]);
            return NextResponse.json(stats, { status: 200 });
        }

        // Find all variant IDs with the same styleId
        const variants = await Product.find({ styleId: currentProduct.styleId }, '_id');
        const variantIds = variants.map(v => v._id);
        
        const stats = await getStatsForProductIds(variantIds);

        return NextResponse.json(stats, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch review stats:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

async function getStatsForProductIds(productIds: Types.ObjectId[]): Promise<ReviewStats> {
    const stats = await Review.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
            $group: {
                _id: null, // Group all found reviews together
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
        return { totalRatings, totalReviews, averageRating: averageRating || 0 };
    } else {
        // No reviews found, return zero stats
        return { totalRatings: 0, totalReviews: 0, averageRating: 0 };
    }
}
