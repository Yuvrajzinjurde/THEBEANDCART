
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOtp } from '@/ai/flows/generate-otp-flow';

const sendOtpSchema = z.object({
  phone: z.string().min(10, "A valid phone number is required."),
});

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

    // In a real-world scenario, you would integrate with an SMS gateway like Twilio here
    // and send the `otp` to the user's `phone` number.
    // e.g., await twilio.messages.create({ body: `Your OTP is: ${otp}`, from: '+1234567890', to: phone });

    // For this simulation, we will return the OTP in the response
    // so the frontend can display it in a toast for verification.
    // In production, you would NOT return the OTP here.
    return NextResponse.json({ 
      message: `OTP sent successfully to ${phone}.`,
      otp: otp // IMPORTANT: For simulation only. Remove in production.
    }, { status: 200 });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred while sending OTP' }, { status: 500 });
  }
}
