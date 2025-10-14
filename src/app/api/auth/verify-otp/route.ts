
import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';

const STATIC_OTP = "123456";

const otpSchema = z.object({
    phone: z.string().min(10, "Invalid phone number"),
    code: z.string().min(6, "OTP must be 6 characters long"),
});

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        const userId = decoded.sub;

        await dbConnect();
        
        const body = await req.json();
        const validation = otpSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Phone and OTP are required.' }, { status: 400 });
        }
        
        const { phone, code } = validation.data;

        if (code === STATIC_OTP) {
            await User.findByIdAndUpdate(userId, { 
                phone: phone,
                isPhoneVerified: true 
            });
            return NextResponse.json({ message: 'Phone number verified successfully.' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Invalid OTP. Please try again.' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}
