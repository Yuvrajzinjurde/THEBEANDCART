
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

// POST to mark all notifications for a user as read
export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = getToken();
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwt.decode(token) as DecodedToken;
    const userId = new Types.ObjectId(decoded.userId);

    await Notification.updateMany(
      { recipientUsers: userId }, 
      { $addToSet: { readBy: userId } }
    );

    return NextResponse.json({ message: 'All notifications marked as read' }, { status: 200 });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
