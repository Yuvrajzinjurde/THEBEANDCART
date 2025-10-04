
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/notification.model';
import { jwtDecode } from 'jwt-decode';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

// GET all notifications for the authenticated user
export async function GET(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwtDecode<DecodedToken>(token);
    const userId = decoded.userId;

    const notifications = await Notification.find({ 
      recipientUsers: new Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
