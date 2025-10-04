
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/notification.model';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
}

// POST to mark all notifications for a user as read
export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwtDecode<DecodedToken>(token);
    const userId = decoded.userId;

    await Notification.updateMany({ userId: userId, isRead: false }, { $set: { isRead: true } });

    return NextResponse.json({ message: 'All notifications marked as read' }, { status: 200 });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
