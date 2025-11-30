
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { z } from 'zod';

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
};

const updateAddressSchema = z.object({
  addressId: z.string().refine(val => Types.ObjectId.isValid(val)),
});

export async function PATCH(
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

        const body = await req.json();
        const validation = updateAddressSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid address ID provided' }, { status: 400 });
        }
        const { addressId } = validation.data;
        
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
        }
        
        const order = await Order.findOne({ _id: id, userId: new Types.ObjectId(userId) });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        const unshippableStatuses = ['shipped', 'delivered', 'cancelled'];
        if (unshippableStatuses.includes(order.status)) {
            return NextResponse.json({ message: `Cannot change address for an order that is ${order.status}.` }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const newAddress = user.addresses.find(addr => (addr._id as Types.ObjectId).toString() === addressId);
        if (!newAddress) {
            return NextResponse.json({ message: 'Selected address not found in your address book.' }, { status: 404 });
        }

        order.shippingAddress = newAddress.toObject();
        await order.save();

        return NextResponse.json({ message: 'Shipping address updated successfully', order }, { status: 200 });

    } catch (error) {
        console.error('Failed to update shipping address:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
