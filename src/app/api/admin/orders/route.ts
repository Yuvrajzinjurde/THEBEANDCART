
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import User from '@/models/user.model';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');
    const status = searchParams.get('status');

    let query: any = {};

    if (brand && brand !== 'All Brands') {
      query.brand = brand;
    }

    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate({
          path: 'userId',
          model: User,
          select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch orders for admin:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
