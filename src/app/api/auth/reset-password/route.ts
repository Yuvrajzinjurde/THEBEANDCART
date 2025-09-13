import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const STATIC_OTP = "123456";

const ResetPasswordAPISchema = z.object({
    email: z.string().email(),
    otp: z.string(),
    newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validation = ResetPasswordAPISchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, otp, newPassword } = validation.data;

    if (otp !== STATIC_OTP) {
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security reasons
      return NextResponse.json({ message: 'Invalid OTP or email' }, { status: 400 });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Password has been reset successfully' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
