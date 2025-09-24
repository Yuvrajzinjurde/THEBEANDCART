
import { NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits."),
});


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, otp } = validation.data;
    
    // THIS IS FOR DEVELOPMENT ONLY
    // In a real app, you would check the OTP against a value stored in a cache (like Redis) or database.
    const staticOtp = "123456"; 

    if (otp !== staticOtp) {
      return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    }

    // If OTP is correct, create a short-lived token to authorize the final sign-up step
    const signUpToken = jwt.sign(
        { email, verified: true }, 
        JWT_SECRET, 
        { expiresIn: '5m' }
    );

    return NextResponse.json({ 
        message: 'Email verified successfully.',
        signUpToken,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Verify Email OTP Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
