import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginSchema } from '@/lib/auth';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Please define JWT_SECRET and JWT_REFRESH_SECRET environment variables inside .env');
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, brand } = validation.data;

    const user = await User.findOne({ email }).select('+password').populate({
        path: 'roles',
        model: Role
    });
    
    if (!user) {
      return NextResponse.json({ message: 'Email not found. Please check your email or sign up.' }, { status: 404 });
    }

    if (user.status === 'blocked') {
        return NextResponse.json({ message: 'Your account has been blocked. Please contact support.' }, { status: 403 });
    }

    const userRoles = user.roles.map((role: any) => role.name);
    const isAdmin = userRoles.includes('admin');

    if (!isAdmin && user.brand !== brand) {
      return NextResponse.json({ message: 'This account is not associated with this brand.' }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ message: 'Password not set for this account. Please use password reset.' }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid password. Please try again.' }, { status: 401 });
    }
    
    const accessToken = jwt.sign(
      { roles: userRoles, name: user.firstName, brand: user.brand, userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '15m', subject: user._id.toString() }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d', subject: user._id.toString() }
    );

    const accessTokenCookie = serialize('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 15,
        path: '/',
    });
    
    const refreshTokenCookie = serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    const userResponseData = user.toObject();
    // Add userId to the user object being sent to the client
    userResponseData.userId = user._id.toString();

    const response = NextResponse.json({ 
        message: 'Login successful', 
        user: {
            ...userResponseData,
            roles: userRoles,
        },
        token: accessToken
    }, { status: 200 });

    response.headers.append('Set-Cookie', accessTokenCookie);
    response.headers.append('Set-Cookie', refreshTokenCookie);

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
