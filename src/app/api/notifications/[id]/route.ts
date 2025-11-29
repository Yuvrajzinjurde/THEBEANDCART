

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

// PATCH to mark a single notification as read
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const userIdString = getUserIdFromToken(req);
    if (!userIdString) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = new Types.ObjectId(userIdString);
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid notification ID' }, { status: 400 });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientUsers: userId },
      { $addToSet: { readBy: userId } }, // Add user to readBy array if not already present
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found or not intended for user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification marked as read', notification }, { status: 200 });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
