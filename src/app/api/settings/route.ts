
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/settings.model';
import { z } from 'zod';

const CartSettingsSchema = z.object({
    freeShippingThreshold: z.coerce.number().min(0, "Threshold must be a positive number"),
    extraDiscountThreshold: z.coerce.number().min(0, "Threshold must be a positive number"),
    freeGiftThreshold: z.coerce.number().min(0, "Threshold must be a positive number"),
});


// GET the settings
export async function GET() {
  try {
    await dbConnect();
    // There will only ever be one document for cart settings
    const settings = await Settings.findOne({});
    if (!settings) {
      // If no settings exist, return default values from the model
      const defaultSettings = new Settings();
      return NextResponse.json(defaultSettings.toObject(), { status: 200 });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch cart settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// CREATE or UPDATE the settings
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = CartSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Use findOneAndUpdate with upsert:true to create if it doesn't exist, or update if it does.
    const settings = await Settings.findOneAndUpdate(
        {}, // An empty filter will match the first document found or create a new one
        validation.data,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('Failed to save cart settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
