import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/coupon.model';
import { CouponFormSchema } from '@/lib/coupon-schema';


export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');
    
    let query: any = {};
    if (brand && brand !== 'All Brands') {
        // Find coupons for the specific brand OR coupons applicable to 'All Brands'
        query.$or = [{ brand: brand }, { brand: 'All Brands' }];
    } else if (brand === 'All Brands') {
        // Admin viewing 'All Brands' sees only those, not specific ones
        query.brand = 'All Brands';
    }


    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = CouponFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { code } = validation.data;
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
        return NextResponse.json({ message: `Coupon code '${code}' already exists.` }, { status: 409 });
    }
    
    const newCoupon = new Coupon(validation.data);
    await newCoupon.save();

    return NextResponse.json({ message: 'Coupon created successfully', coupon: newCoupon }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create coupon:', error);
    if (error.code === 11000) {
        return NextResponse.json({ message: 'A coupon with this code already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}