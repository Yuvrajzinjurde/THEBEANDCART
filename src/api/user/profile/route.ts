

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import { jwtDecode } from 'jwt-decode';
import { Types } from 'mongoose';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

interface DecodedToken {
  userId: string;
}

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().optional(),
  profilePicUrl: z.string().optional(), // Allow any string, including data URIs or empty strings
});

const addressSchema = z.object({
  _id: z.string().optional(), // Can be undefined for new addresses
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  type: z.enum(['Home', 'Office', 'Other']),
  otherType: z.string().optional(),
  isDefault: z.boolean(),
});

const updateProfileSchema = z.object({
    profile: profileFormSchema.optional(),
    addresses: z.array(addressSchema).optional(),
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
        
        if (!decoded.userId || !Types.ObjectId.isValid(decoded.userId)) {
            return NextResponse.json({ message: 'User not found. Invalid ID format.' }, { status: 404 });
        }
        const userId = new Types.ObjectId(decoded.userId);

        const user = await User.findById(userId).populate('roles');

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


        if (!decoded.userId || !Types.ObjectId.isValid(decoded.userId)) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const userId = new Types.ObjectId(decoded.userId);

        const body = await req.json();
        const validation = updateProfileSchema.safeParse(body);
        
        if (!validation.success) {
            console.error("Profile update validation error:", validation.error.flatten());
            return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const user = await User.findById(userId).populate('roles');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const { profile, addresses } = validation.data;

        if (profile) {
            user.firstName = profile.firstName;
            user.lastName = profile.lastName;
            user.phone = profile.phone;
            user.profilePicUrl = profile.profilePicUrl;
        }

        if (addresses) {
            // If default is being set, ensure only one is default
            const defaultAddressIndex = addresses.findIndex(addr => addr.isDefault);
            if (defaultAddressIndex !== -1) {
                addresses.forEach((addr, index) => {
                    addr.isDefault = index === defaultAddressIndex;
                });
            }
            
            user.addresses = addresses.map(addr => ({ ...addr, _id: addr._id ? new Types.ObjectId(addr._id) : new Types.ObjectId() })) as any;
        }

        const updatedUser = await user.save();

        const userRoles = updatedUser.roles.map((role: any) => role.name);

        const newToken = jwt.sign(
            { 
                userId: updatedUser._id, 
                roles: userRoles, 
                name: updatedUser.firstName, 
                brand: updatedUser.brand, 
                profilePicUrl: updatedUser.profilePicUrl 
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser, token: newToken }, { status: 200 });

    } catch (error) {
        console.error('Failed to update user profile:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
