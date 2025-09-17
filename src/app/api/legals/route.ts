
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Legal, { legalDocTypes, type ILegal } from '@/models/legal.model';
import { z } from 'zod';

const LegalFormSchema = z.object({
  docType: z.enum(legalDocTypes),
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get('docType');

    let query: any = {};
    if (docType) {
        query.docType = docType;
    }

    const documents = await Legal.find(query);

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch legal documents:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = LegalFormSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { docType, title, content } = validation.data;

    // Use findOneAndUpdate with upsert:true to create or update the document based on its type
    const updatedDocument = await Legal.findOneAndUpdate(
        { docType },
        { title, content },
        { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ message: 'Document saved successfully', document: updatedDocument }, { status: 200 });

  } catch (error) {
    console.error('Failed to save legal document:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
