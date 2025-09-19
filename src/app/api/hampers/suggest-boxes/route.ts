
import { NextResponse } from 'next/server';
import { suggestBoxes } from '@/ai/flows/suggest-boxes-flow';

export async function POST(req: Request) {
  try {
    const { occasion, boxes } = await req.json();

    if (!occasion || !boxes) {
      return NextResponse.json({ message: 'Occasion and boxes are required' }, { status: 400 });
    }
    
    const suggestion = await suggestBoxes({ occasion, boxes });
    
    return NextResponse.json(suggestion, { status: 200 });

  } catch (error: any) {
    console.error('AI Box Suggestion Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
