
import { NextResponse } from 'next/server';
import { suggestHamperMessage } from '@/ai/flows/suggest-hamper-message-flow';
import PlatformSettings from '@/models/platform.model';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const settings = await PlatformSettings.findOne({});
    if (!settings || !settings.aiEnabled) {
      return NextResponse.json({ message: 'AI features are currently disabled.' }, { status: 403 });
    }

    const { occasion, products } = await req.json();

    if (!occasion || !products) {
      return NextResponse.json({ message: 'Occasion and products are required' }, { status: 400 });
    }
    
    const suggestion = await suggestHamperMessage({ occasion, products });
    
    return NextResponse.json(suggestion, { status: 200 });

  } catch (error: any) {
    console.error('AI Message Suggestion Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
