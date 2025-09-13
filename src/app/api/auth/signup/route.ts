import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import bcrypt from 'bcryptjs';
import { SignUpSchema } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validation = SignUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, firstName, lastName } = validation.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      // This should not happen if the DB is seeded correctly
      return NextResponse.json({ message: 'User role not found' }, { status: 500 });
    }
    
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName: firstName || 'New',
      lastName: lastName || 'User',
      roles: [userRole._id],
      // Add default empty values for other required fields
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      }
    });

    await newUser.save();
    
    // Don't send the password back
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: 'User created successfully', user: userResponse }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
