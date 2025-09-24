
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import { jwtDecode } from 'jwt-decode';
import { Types } from 'mongoose';
import { z } from 'zod';

interface DecodedToken {
  userId: string;
}

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});


export async function GET(req: Request) {
    try {
        await dbConnect();
        
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required. No token provided.' }, { status: 401 });
        }
        
        let decoded;
        try {
            decoded = jwtDecode<DecodedToken>(token);
        } catch (error) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }
        
        if (!Types.ObjectId.isValid(decoded.userId)) {
            return NextResponse.json({ message: 'User not found. Invalid ID format.' }, { status: 404 });
        }
        const userId = new Types.ObjectId(decoded.userId);

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        await dbConnect();
        
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwtDecode<DecodedToken>(token);
        } catch (error) {
             return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }


        if (!Types.ObjectId.isValid(decoded.userId)) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const userId = new Types.ObjectId(decoded.userId);

        const body = await req.json();
        const validation = profileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const updatedUser = await User.findByIdAndUpdate(userId, validation.data, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error('Failed to update user profile:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
