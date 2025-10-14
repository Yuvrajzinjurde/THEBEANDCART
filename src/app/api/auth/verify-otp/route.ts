
import { NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import jwt from 'jsonwebtoken';

const otpSchema = z.object({
    phone: z.string().min(10, "Invalid phone number"),
    code: z.string().min(6, "OTP must be 6 characters long"),
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verificationServiceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;

if (!accountSid || !authToken || !verificationServiceSid) {
    console.error("Twilio environment variables are not set.");
}

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
    if (!accountSid || !authToken || !verificationServiceSid) {
        return NextResponse.json({ message: 'Twilio service is not configured.' }, { status: 500 });
    }

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
        const formattedPhone = `+91${phone}`;

        const verification_check = await client.verify.v2.services(verificationServiceSid)
            .verificationChecks
            .create({ to: formattedPhone, code });

        if (verification_check.status === 'approved') {
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
