
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import { z } from 'zod';
import { Types } from 'mongoose';

const updateSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid product ID",
  }),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

const bulkUpdateSchema = z.object({
  updates: z.array(updateSchema),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { updates } = validation.data;

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No valid updates provided' }, { status: 400 });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.productId) },
        update: { $set: { stock: update.stock } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps);

    return NextResponse.json({ 
        message: 'Stock updated successfully', 
        updatedCount: result.modifiedCount 
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk Stock Update Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
