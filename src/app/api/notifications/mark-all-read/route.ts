
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/notification.model';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

const getUserIdFromToken = (req: Request): string | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.decode(token) as DecodedToken;
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// POST to mark all notifications for a user as read
export async function POST(req: Request) {
  try {
    await dbConnect();
    const userIdString = getUserIdFromToken(req);
    if (!userIdString) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = new Types.ObjectId(userIdString);

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
