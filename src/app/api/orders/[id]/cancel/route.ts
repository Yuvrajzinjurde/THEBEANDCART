
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import Product from '@/models/product.model';
import PlatformSettings from '@/models/platform.model';
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
        
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
        }
        
        const order = await Order.findOne({ _id: id, userId: new Types.ObjectId(userId) });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        const settings = await PlatformSettings.findOne({});
        const cancellableUntilStatus = settings?.cancellableOrderStatus || 'pending';
        const cancellableStatuses = ['pending', 'on-hold'];
        if (cancellableUntilStatus === 'ready-to-ship') {
            cancellableStatuses.push('ready-to-ship');
        }

        if (!cancellableStatuses.includes(order.status)) {
            return NextResponse.json({ message: `Order cannot be cancelled as it is already ${order.status}.` }, { status: 400 });
        }

        order.status = 'cancelled';
        await order.save();

        // Restore stock for cancelled items
        const bulkWriteOps = order.products.map(item => ({
            updateOne: {
                filter: { _id: item.productId },
                update: { $inc: { stock: item.quantity } },
            }
        }));
        await Product.bulkWrite(bulkWriteOps);

        return NextResponse.json({ message: 'Order cancelled successfully', order }, { status: 200 });

    } catch (error) {
        console.error('Failed to cancel order:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
