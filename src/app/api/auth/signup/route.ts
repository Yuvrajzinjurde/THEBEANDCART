
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import bcrypt from 'bcryptjs';
import { z } from "zod";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Adjusted SignUp schema for this endpoint
const SecureSignUpSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  brand: z.string().min(1),
  signUpToken: z.string().min(1, "Verification token is required."),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validation = SecureSignUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, firstName, lastName, brand, signUpToken } = validation.data;

    // Verify the sign-up token
    let decodedToken;
    try {
        decodedToken = jwt.verify(signUpToken, JWT_SECRET) as { email: string, verified: boolean };
    } catch (error) {
        return NextResponse.json({ message: 'Invalid or expired verification token.' }, { status: 401 });
    }
    
    // Check if the token is valid for this email and is marked as verified
    if (!decodedToken.verified || decodedToken.email !== email) {
        return NextResponse.json({ message: 'Could not verify your email. Please try again.' }, { status: 401 });
    }

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
      brand: brand, // Save the brand permanent name
<<<<<<< HEAD
      isEmailVerified: true, // Mark email as verified
      addresses: [], // Start with an empty array
=======
      addresses: [] // Initialize with an empty array
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
    });

    await newUser.save();
    
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: 'User created successfully', user: userResponse }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
