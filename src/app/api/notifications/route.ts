
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/notification.model';
import { Types } from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
}

const getToken = () => {
    const cookieStore = cookies();
    return cookieStore.get('accessToken')?.value;
}

// GET all notifications for the authenticated user
export async function GET(req: Request) {
  try {
    await dbConnect();
    const token = getToken();
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwt.decode(token) as DecodedToken;
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
