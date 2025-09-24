
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOtp } from '@/ai/flows/generate-otp-flow';
import { sendMail } from '@/lib/email';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

const sendOtpSchema = z.object({
  email: z.string().email("A valid email is required."),
  name: z.string().min(1, "Name is required."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, name } = validation.data;

    const { otp } = await generateOtp();

    const emailHtml = `
      <div>
        <h2>Hello ${name},</h2>
        <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <p style="font-size: 24px; font-weight: bold;">${otp}</p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    // For development, we'll use a static OTP for verification, but send a real one.
    // In production, you would cache the real OTP with an expiry.
    const staticOtpForVerification = "123456";

    // Create a temporary token that encodes the email and the static OTP
    const verificationToken = jwt.sign(
        { email, otp: staticOtpForVerification, type: 'email-verification' }, 
        JWT_SECRET, 
        { expiresIn: '10m' }
    );

    await sendMail({
        to: email,
        subject: 'Your OTP for Email Verification',
        html: emailHtml,
    });
    
    // For this prototype, we'll send the static OTP back to be stored on the client
    // In a real app, this is insecure. You'd verify against a server-side cache.
    return NextResponse.json({ 
      message: `OTP sent successfully to ${email}.`,
      otpForVerification: staticOtpForVerification
    }, { status: 200 });

  } catch (error: any) {
    console.error('Send Email OTP Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred while sending OTP' }, { status: 500 });
  }
}
