

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Hamper from '@/models/hamper.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

const getUserIdFromToken = (req: Request): string | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

const HamperUpdateSchema = z.object({
    occasion: z.string().optional(),
    boxId: z.string().refine(val => Types.ObjectId.isValid(val)).optional(),
    boxVariantId: z.string().refine(val => Types.ObjectId.isValid(val)).optional(),
    bagId: z.string().refine(val => Types.ObjectId.isValid(val)).optional(),
    bagVariantId: z.string().refine(val => Types.ObjectId.isValid(val)).optional(),
    products: z.array(z.string().refine(val => Types.ObjectId.isValid(val))).optional(),
    notesToCreator: z.string().optional(),
    notesToReceiver: z.string().optional(),
    addRose: z.boolean().optional(),
});

// GET the user's active (incomplete) hamper
export async function GET(req: Request) {
    await dbConnect();
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        
        const hamper = await Hamper.findOne({ userId, isComplete: false });

        return NextResponse.json({ hamper }, { status: 200 });

    } catch (error) {
        console.error("GET Hamper Error:", error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


// POST to create or update a hamper
export async function POST(req: Request) {
    await dbConnect();
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const body = await req.json();
        const validation = HamperUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        // Use findOneAndUpdate with upsert to create or update the user's active hamper
        const updatedHamper = await Hamper.findOneAndUpdate(
            { userId, isComplete: false },
            { $set: { ...validation.data, userId } },
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json({ message: 'Hamper progress saved', hamper: updatedHamper }, { status: 200 });

    } catch (error) {
        console.error("POST Hamper Error:", error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// DELETE the active hamper
export async function DELETE(req: Request) {
    await dbConnect();
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        
        await Hamper.deleteOne({ userId, isComplete: false });

        return NextResponse.json({ message: 'Hamper progress discarded' }, { status: 200 });

    } catch (error) {
        console.error("DELETE Hamper Error:", error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
