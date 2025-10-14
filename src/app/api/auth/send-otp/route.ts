
import { NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';

const phoneSchema = z.string().min(10, "Invalid phone number");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verificationServiceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;


export async function POST(req: Request) {
    if (!accountSid || !authToken || !verificationServiceSid) {
        console.error("Twilio environment variables are not set.");
        return NextResponse.json({ message: 'Twilio service is not configured.' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    try {
        const body = await req.json();
        const phoneValidation = phoneSchema.safeParse(body.phone);

        if (!phoneValidation.success) {
            return NextResponse.json({ message: 'A valid phone number is required.' }, { status: 400 });
        }
        
        const phone = `+91${phoneValidation.data}`; // Assuming Indian numbers

        const verification = await client.verify.v2.services(verificationServiceSid)
            .verifications
            .create({ to: phone, channel: 'sms' });
        
        if (verification.status === 'pending') {
            return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });
        } else {
             throw new Error('Failed to send OTP.');
        }

    } catch (error: any) {
        console.error('Send OTP Error:', error);
        // Ensure a JSON response is always sent, even on uncaught errors
        return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}
