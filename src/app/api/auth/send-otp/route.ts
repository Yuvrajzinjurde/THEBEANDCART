
import { NextResponse } from 'next/server';
import { z } from 'zod';
<<<<<<< HEAD
import { generateOtp } from '@/ai/flows/generate-otp-flow';
import { Twilio } from 'twilio';

const sendOtpSchema = z.object({
  phone: z.string().min(10, "A valid phone number is required."),
});

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  try {

    if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('Twilio phone number is not configured in environment variables.');
    }

    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { phone } = validation.data;

    // Generate a secure OTP using the Genkit flow
    const { otp } = await generateOtp();

    // Use the Twilio client to send the SMS
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone, 
    });

    // IMPORTANT: For security, the OTP is NOT returned in the API response.
    return NextResponse.json({ 
      message: `OTP sent successfully to ${phone}.`,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Send OTP Error:', error);
    // Provide a more specific message if the error is from Twilio configuration
    if (error.message.includes('Twilio phone number is not configured')) {
        return NextResponse.json({ message: 'The application is not configured to send SMS. Please contact support.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred while sending OTP' }, { status: 500 });
  }
=======

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
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
}
