
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

    // If a user exists but has no password (e.g. social login in future), this prevents a crash.
    if (!user.password) {
      return NextResponse.json({ message: 'Password not set for this account. Please use password reset.' }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid password. Please try again.' }, { status: 401 });
    }
    
<<<<<<< HEAD
    const token = jwt.sign(
      { userId: user._id, roles: userRoles, name: user.firstName, brand: user.brand, profilePicUrl: user.profilePicUrl },
=======
    const accessToken = jwt.sign(
      { roles: userRoles, name: user.firstName, brand: user.brand },
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
      JWT_SECRET,
      { expiresIn: '15m', subject: user._id.toString() }
    );

    const refreshToken = jwt.sign(
      { sub: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const accessTokenCookie = serialize('accessToken', accessToken, {
        httpOnly: false, // Make it accessible to client-side script
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
    delete userResponseData.password;

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
