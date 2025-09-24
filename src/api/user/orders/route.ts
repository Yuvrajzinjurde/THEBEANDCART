
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import { jwtDecode } from 'jwt-decode';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwtDecode<DecodedToken>(token);
        } catch (error) {
             // If token is invalid or expired, return an empty list gracefully
             return NextResponse.json({ orders: [] }, { status: 200 });
        }
        
        if (!Types.ObjectId.isValid(decoded.userId)) {
             // If the decoded ID is not a valid format, it can't be a real user
            return NextResponse.json({ orders: [] }, { status: 200 });
        }
        const userId = new Types.ObjectId(decoded.userId);

        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
