
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
            return NextResponse.json({ orders: [] }, { status: 200 });
        }

        let decoded;
        try {
            decoded = jwtDecode<DecodedToken>(token);
        } catch (error) {
             return NextResponse.json({ orders: [] }, { status: 200 });
        }
        
        if (!Types.ObjectId.isValid(decoded.userId)) {
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
