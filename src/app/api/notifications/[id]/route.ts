
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/notification.model';
import { jwtDecode } from 'jwt-decode';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

// PATCH to mark a single notification as read
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwtDecode<DecodedToken>(token);
    const userId = decoded.userId;
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid notification ID' }, { status: 400 });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification marked as read', notification }, { status: 200 });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
