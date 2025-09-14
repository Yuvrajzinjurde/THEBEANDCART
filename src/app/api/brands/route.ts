
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/brand.model';
import { BrandFormSchema } from '@/components/admin/brand-form';

export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find({}).sort({ displayName: 1 });
    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = BrandFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { permanentName } = validation.data;

    // Use a case-insensitive regex for the check
    const existingBrand = await Brand.findOne({ permanentName: { $regex: new RegExp(`^${permanentName}$`, 'i') } });
    if (existingBrand) {
      return NextResponse.json({ message: `A brand with permanent name '${permanentName}' already exists.` }, { status: 409 });
    }
    
    const newBrand = new Brand(validation.data);
    await newBrand.save();

    return NextResponse.json({ message: 'Brand created successfully', brand: newBrand }, { status: 201 });

  } catch (error) {
    console.error('Failed to create brand:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}


    