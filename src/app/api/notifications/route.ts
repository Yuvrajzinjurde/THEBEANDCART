

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/notification.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

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

// GET all notifications for the authenticated user
export async function GET(req: Request) {
  try {
    await dbConnect();
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const notifications = await Notification.find({ 
      recipientUsers: new Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
