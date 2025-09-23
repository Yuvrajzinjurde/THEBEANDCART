
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlatformSettings from '@/models/platform.model';
import { z } from 'zod';
import { themeColors } from '@/lib/brand-schema';

const SocialLinksSchema = z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
});

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
  imageHint: z.string().min(1, "Image hint is required"),
});

const promoBannerSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
  buttonText: z.string(),
  buttonLink: z.string(),
}).optional();

const FormSchema = z.object({
  platformName: z.string().min(1),
  platformLogoUrl: z.string().url().or(z.literal('')),
  platformFaviconUrl: z.string().url().or(z.literal('')),
  platformThemeName: z.string(),
  socials: SocialLinksSchema.optional(),
  aiEnabled: z.boolean().optional(),
  hamperFeatureEnabled: z.boolean().optional(),
  promoBannerEnabled: z.boolean().optional(),
  heroBanners: z.array(bannerSchema),
  featuredCategories: z.array(z.string()).optional(),
  promoBanner: promoBannerSchema,
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
      console.error("Platform Settings Validation Error:", validation.error.flatten());
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { platformThemeName, ...restOfData } = validation.data;
    const theme = themeColors.find(t => t.name === platformThemeName);

    if (!theme) {
      return NextResponse.json({ message: 'Invalid theme name' }, { status: 400 });
    }
    
    const dataToSave = {
      ...restOfData,
      platformThemeName,
      theme: {
        name: theme.name,
        primary: theme.primary,
        background: theme.background,
        accent: theme.accent,
      }
    };

    // Use findOneAndUpdate with upsert:true to create if it doesn't exist, or update if it does.
    const settings = await PlatformSettings.findOneAndUpdate(
        {}, // An empty filter will match the first document found or create a new one
        dataToSave,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('Failed to save platform settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
