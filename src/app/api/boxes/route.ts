
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Box from '@/models/box.model';
import { z } from 'zod';

const BoxSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    images: z.array(z.string().url()).min(1, "At least one image is required"),
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    storefront: z.string().min(1, "Storefront is required"),
});

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const storefront = searchParams.get('storefront');
    
    let query: any = {};
    if (storefront && storefront !== 'All Brands') {
        query.storefront = storefront;
    }

    const boxes = await Box.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ boxes }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch boxes:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = BoxSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newBox = new Box(validation.data);
    await newBox.save();

    return NextResponse.json({ message: 'Box created successfully', box: newBox }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create box:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
