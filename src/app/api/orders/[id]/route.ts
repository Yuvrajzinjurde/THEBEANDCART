
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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;
        const userId = getUserIdFromToken(req);

        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
        }
        
        const order = await Order.findOne({ _id: id, userId: new Types.ObjectId(userId) })
            .populate({
                path: 'products.productId',
                model: Product,
                select: 'name images sellingPrice'
            })
            .lean();

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch order details:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
