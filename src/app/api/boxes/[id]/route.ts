
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Box from '@/models/box.model';
import { Types } from 'mongoose';

// PATCH to update likes
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

         if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        }
        
        const updatedBox = await Box.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });

        if (!updatedBox) {
            return NextResponse.json({ message: 'Box not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Like count updated', box: updatedBox }, { status: 200 });

    } catch (error) {
        console.error('Failed to update box likes:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


// DELETE a specific box
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

         if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        }
        
        const box = await Box.findByIdAndDelete(id);

        if (!box) {
            return NextResponse.json({ message: 'Box not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Box deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete box:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
