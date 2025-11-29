
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import { Types } from 'mongoose';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'ready-to-ship' },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order accepted', order: updatedOrder }, { status: 200 });

  } catch (error) {
    console.error('Failed to accept order:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
