
'use server';

/**
 * @fileOverview An AI agent that summarizes a legal document into key points.
 *
 * - summarizeLegalDocument - Converts document text into a concise summary.
 * - SummarizeLegalDocInput - Input type for the summarizeLegalDocument function.
 * - SummarizeLegalDocOutput - Return type for the summarizeLegalDocOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalDocInputSchema = z.object({
    documentContent: z
        .string()
        .describe('The full HTML content of the legal document to be summarized.'),
});
export type SummarizeLegalDocInput = z.infer<typeof SummarizeLegalDocInputSchema>;

const SummarizeLegalDocOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key points from the document, formatted as a simple HTML list (e.g., <ul><li>Point 1</li>...</ul>).'),
});
export type SummarizeLegalDocOutput = z.infer<typeof SummarizeLegalDocOutputSchema>;

export async function summarizeLegalDocument(input: SummarizeLegalDocInput): Promise<SummarizeLegalDocOutput> {
  return summarizeLegalDocFlow(input);
}

const summarizeLegalDocPrompt = ai.definePrompt({
  name: 'summarizeLegalDocPrompt',
  input: {schema: SummarizeLegalDocInputSchema},
  output: {schema: SummarizeLegalDocOutputSchema},
  model: 'googleai/gemini-1.5-flash-preview-001',
  prompt: `You are an expert legal assistant. Your task is to summarize a legal document into its most important points for a customer.

  Extract the key information regarding:
  - Timeframe for returns (e.g., "7 days", "30 days").
  - Condition of the item (e.g., "unused", "original packaging").
  - Any non-returnable items.

  Format the output as a clean, simple HTML unordered list (<ul>). Do not include any titles or introductory text. Just the list itself.

  Document to Summarize:
  {{{documentContent}}}
  `,
});

const summarizeLegalDocFlow = ai.defineFlow(
  {
    name: 'summarizeLegalDocFlow',
    inputSchema: SummarizeLegalDocInputSchema,
    outputSchema: SummarizeLegalDocOutputSchema,
  },
  async input => {
    const {output} = await summarizeLegalDocPrompt(input);
    return output!;
  }
);
