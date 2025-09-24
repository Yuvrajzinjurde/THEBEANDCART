
import { NextResponse } from 'next/server';
import { z } from 'zod';
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
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone, 
    });

    // IMPORTANT: For security, the OTP is NOT returned in the API response.
    // The frontend will use a static OTP for verification in this prototype.
    return NextResponse.json({ 
      message: `OTP sent successfully to ${phone}.`,
    }, { status: 200 });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred while sending OTP' }, { status: 500 });
  }
}
