
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import { Types } from 'mongoose';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  nickname: z.string().optional(),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  socials: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
    telegram: z.string().optional(),
  }).optional(),
  profilePicUrl: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(id, validation.data, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
