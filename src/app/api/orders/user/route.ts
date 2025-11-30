
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import Product from '@/models/product.model';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface DecodedToken {
  sub: string;
}

const getUserIdFromToken = (req: Request): string | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded.sub;
    } catch (error) {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const orders = await Order.find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .populate({
                path: 'products.productId',
                model: Product,
                select: 'name images sellingPrice'
            })
            .lean();

        return NextResponse.json({ orders }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
