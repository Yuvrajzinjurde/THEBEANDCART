
'use server';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Legal from '@/models/legal.model';
import PlatformSettings from '@/models/platform.model';
import { summarizeLegalDocument } from '@/ai/flows/summarize-legal-doc-flow';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Fetch Platform Settings to check if AI is enabled
        const settings = await PlatformSettings.findOne({});
        const aiEnabled = settings?.aiEnabled ?? true; // Default to true if not set

        // 2. Fetch the return policy document
        const returnPolicy = await Legal.findOne({ docType: 'return-policy' });

        if (!returnPolicy) {
            return NextResponse.json({ summary: '<p>Return policy details not available.</p>' });
        }

        // 3. If AI is not enabled, return a default message with a link
        if (!aiEnabled) {
            return NextResponse.json({
                summary: '<p>Please refer to our full return policy for details. <a href="/legal/return-policy" class="text-primary underline">Click here</a>.</p>'
            });
        }
        
        // 4. If AI is enabled, proceed with summarization
        const summaryResult = await summarizeLegalDocument({ documentContent: returnPolicy.content });
        
        return NextResponse.json({ summary: summaryResult.summary });

    } catch (error: any) {
        console.error('Failed to summarize legal document:', error);
        // Provide a safe fallback response in case of any error
        return NextResponse.json({
            summary: '<p>Could not load summary. Please check our <a href="/legal/return-policy" class="text-primary underline">full return policy</a>.</p>'
        }, { status: 500 });
    }
}
