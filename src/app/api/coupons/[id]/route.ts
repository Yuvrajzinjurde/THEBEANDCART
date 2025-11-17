import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/coupon.model';
import { CouponFormSchema } from '@/lib/coupon-schema';
import { Types } from 'mongoose';

// GET a specific coupon
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Coupon ID' }, { status: 400 });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// UPDATE a specific coupon
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    if (!Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Coupon ID' }, { status: 400 });
    }

    const validation = CouponFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const coupon = await Coupon.findByIdAndUpdate(id, validation.data, { new: true });

    if (!coupon) {
      return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Coupon updated successfully', coupon }, { status: 200 });

  } catch (error) {
    console.error('Failed to update coupon:', error);
    if ((error as any).code === 11000) {
        return NextResponse.json({ message: 'Another coupon with this code might already exist.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// DELETE a specific coupon
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

         if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Coupon ID' }, { status: 400 });
        }
        
        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Coupon deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete coupon:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}