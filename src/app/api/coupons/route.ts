
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/coupon.model';
import { z } from 'zod';

// Use the same robust schema as the frontend form to handle preprocessing.
const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Discount value must be a number.' }).optional()
  ),
  minPurchase: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : Number(val)),
    z.number({ invalid_type_error: 'Minimum purchase must be a number.' }).min(0)
  ),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})
.refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date.",
    path: ["endDate"],
})
.refine(data => {
    if (data.type === 'percentage') {
      if (typeof data.value !== 'number') return false; // Must have a value
      return data.value >= 0 && data.value <= 100;
    }
    if (data.type === 'fixed') {
      return typeof data.value === 'number' && data.value >= 0; // Must have a value
    }
    if (data.type === 'free-shipping') {
      return data.value === undefined; // Must NOT have a value
    }
    return true;
}, {
    message: "A valid discount value is required and must be within the correct range for the selected type.",
    path: ["value"],
});


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
