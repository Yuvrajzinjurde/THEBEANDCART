
import { NextResponse } from 'next/server';
import { z } from 'zod';

const phoneSchema = z.string().min(10, "Invalid phone number");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const phoneValidation = phoneSchema.safeParse(body.phone);

        if (!phoneValidation.success) {
            return NextResponse.json({ message: 'A valid phone number is required.' }, { status: 400 });
        }
        
        // This route now just simulates success for static OTP flow.
        return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Send OTP Error (Static):', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}
