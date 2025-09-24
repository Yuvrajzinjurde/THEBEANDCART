
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginSchema } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
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
    
    // If user does not exist, fail authentication.
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check if the user is blocked
    if (user.status === 'blocked') {
        return NextResponse.json({ message: 'Your account has been blocked. Please contact support.' }, { status: 403 });
    }

    const userRoles = user.roles.map((role: any) => role.name);
    const isAdmin = userRoles.includes('admin');

    // Security: If the user is NOT an admin, check if their brand matches the request brand.
    if (!isAdmin && user.brand !== brand) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // If a user exists but has no password (e.g. social login in future), this prevents a crash.
    if (!user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = jwt.sign(
      { userId: user._id, roles: userRoles, name: user.firstName, brand: user.brand },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    return NextResponse.json({ 
        message: 'Login successful', 
        token,
        name: user.firstName,
        roles: userRoles,
        brand: user.brand
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
