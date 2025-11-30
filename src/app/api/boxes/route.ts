
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Box from '@/models/box.model';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const boxes = await Box.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ boxes }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch boxes:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
