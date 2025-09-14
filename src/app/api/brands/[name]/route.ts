
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/brand.model';
import { BrandFormSchema } from '@/components/admin/brand-form';

// GET a specific brand by permanent name
export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    await dbConnect();
    const { name } = params;

    // Use a case-insensitive regex for the search
    const brand = await Brand.findOne({ permanentName: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (!brand) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ brand }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// UPDATE a specific brand
export async function PUT(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    await dbConnect();
    const { name } = params;
    const body = await req.json();

    // We don't validate permanentName here because it can't be changed.
    const validation = BrandFormSchema.omit({ permanentName: true }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Use a case-insensitive regex for the search
    const brand = await Brand.findOneAndUpdate({ permanentName: { $regex: new RegExp(`^${name}$`, 'i') } }, validation.data, { new: true });

    if (!brand) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Brand updated successfully', brand }, { status: 200 });

  } catch (error) {
    console.error('Failed to update brand:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
