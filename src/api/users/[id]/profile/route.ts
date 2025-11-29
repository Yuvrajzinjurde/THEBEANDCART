
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import { Types } from 'mongoose';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const addressSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
});

const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  nickname: z.string().optional().or(z.literal('')),
  displayName: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  addresses: z.array(addressSchema).optional(),
  socials: z.object({
    twitter: z.string().optional().or(z.literal('')),
    facebook: z.string().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    linkedin: z.string().optional().or(z.literal('')),
    website: z.string().optional().or(z.literal('')),
    telegram: z.string().optional().or(z.literal('')),
  }).optional(),
  profilePicUrl: z.string().optional().or(z.literal('')),
});

export async function PUT(
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
    const requestingUserId = decoded.sub; // Use 'sub' field for subject (user ID)
    
    await dbConnect();
    const { id } = params;
    
    if (requestingUserId !== id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }
    
    const body = await req.json();
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(id, validation.data, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const userObject = updatedUser.toObject();
    delete userObject.password;

    return NextResponse.json({ message: 'Profile updated successfully', user: userObject }, { status: 200 });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
