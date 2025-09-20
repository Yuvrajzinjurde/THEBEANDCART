
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlatformSettings from '@/models/platform.model';
import { z } from 'zod';

const FormSchema = z.object({
  aiEnabled: z.boolean().optional(),
  hamperFeatureEnabled: z.boolean().optional(),
  heroBanners: z.array(z.object({
      title: z.string(),
      description: z.string(),
      imageUrl: z.string(),
      imageHint: z.string(),
  })),
  featuredCategories: z.array(z.string()),
  promoBanner: z.object({
      title: z.string(),
      description: z.string(),
      imageUrl: z.string(),
      imageHint: z.string(),
      buttonText: z.string(),
      buttonLink: z.string(),
  }).optional(),
  offers: z.array(z.object({
      title: z.string(),
      description: z.string(),
      code: z.string(),
  })).optional(),
});

// GET the platform settings
export async function GET() {
  try {
    await dbConnect();
    // There will only ever be one document for platform settings
    const settings = await PlatformSettings.findOne({});
    if (!settings) {
      // If no settings exist, return null or a default structure
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

    const validation = FormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Use findOneAndUpdate with upsert:true to create if it doesn't exist, or update if it does.
    const settings = await PlatformSettings.findOneAndUpdate(
        {}, // An empty filter will match the first document found or create a new one
        validation.data,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('Failed to save platform settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
