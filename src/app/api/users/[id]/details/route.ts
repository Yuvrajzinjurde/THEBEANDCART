
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });

    // We don't want to send the password hash
    const userObject = user.toObject();
    delete userObject.password;

    return NextResponse.json({ user: userObject, orders }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
