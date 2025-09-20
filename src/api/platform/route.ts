
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlatformSettings from '@/models/platform.model';
import { PlatformSettingsValidationSchema } from '@/lib/brand-schema';

// GET the platform settings
export async function GET() {
  try {
    await dbConnect();
    const settings = await PlatformSettings.findOne({});
    if (!settings) {
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch platform settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// CREATE or UPDATE the platform settings
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = PlatformSettingsValidationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const settings = await PlatformSettings.findOneAndUpdate(
        {}, 
        validation.data,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('Failed to save platform settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

    