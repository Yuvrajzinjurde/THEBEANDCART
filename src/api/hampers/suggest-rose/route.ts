
import { NextResponse } from 'next/server';
import { suggestDriedRose } from '@/ai/flows/suggest-dried-rose-flow';

export async function POST(req: Request) {
  try {
    const { occasion } = await req.json();

    if (!occasion) {
      return NextResponse.json({ message: 'Occasion is required' }, { status: 400 });
    }
    
    const suggestion = await suggestDriedRose({ occasion });
    
    return NextResponse.json(suggestion, { status: 200 });

  } catch (error: any) {
    console.error('AI Suggestion Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
