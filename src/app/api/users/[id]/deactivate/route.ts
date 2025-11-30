
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

const STATIC_OTP = "123456";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const requestingUserId = decoded.sub;
    
    await dbConnect();
    const { id } = params;
    const { otp } = await req.json();
    
    if (requestingUserId !== id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }
    
    if (otp !== STATIC_OTP) {
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { status: 'blocked' }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // In a real app, you would also invalidate any refresh tokens here.

    return NextResponse.json({ message: 'Account deactivated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to deactivate account:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
