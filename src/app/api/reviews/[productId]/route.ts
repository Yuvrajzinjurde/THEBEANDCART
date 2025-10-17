
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/review.model';
import Product from '@/models/product.model';
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
        
        // Find the product to get its styleId
        const currentProduct = await Product.findById(productId, 'styleId');
        if (!currentProduct || !currentProduct.styleId) {
             // Fallback for products without variants
            const reviews = await Review.find({ productId }).sort({ likes: -1 }).limit(10);
            return NextResponse.json({ reviews }, { status: 200 });
        }

        // Find all variant product IDs with the same styleId
        const variants = await Product.find({ styleId: currentProduct.styleId }, '_id');
        const variantIds = variants.map(v => v._id);

        // Find all reviews that belong to any of these variant products
        const reviews = await Review.find({ productId: { $in: variantIds } }).sort({ likes: -1 }).limit(10);

        return NextResponse.json({ reviews }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
