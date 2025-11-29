
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import Rejection from '@/models/rejection.model';
import Product from '@/models/product.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

interface DecodedToken extends jwt.JwtPayload {
  sub: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const { reason } = await req.json();

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const adminUserId = decoded.sub;


    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }
    
    if (!reason) {
        return NextResponse.json({ message: 'Rejection reason is required' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();
    
    // Create rejection record
    await Rejection.create({
        orderId: order._id,
        reason,
        rejectedBy: adminUserId,
    });

    // Restore stock for cancelled items
    const bulkWriteOps = order.products.map(item => ({
        updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: item.quantity } },
        }
    }));
    await Product.bulkWrite(bulkWriteOps);

    return NextResponse.json({ message: 'Order rejected and cancelled', order }, { status: 200 });

  } catch (error) {
    console.error('Failed to reject order:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
