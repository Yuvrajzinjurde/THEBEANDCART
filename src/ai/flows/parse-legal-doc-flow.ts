
'use server';

/**
 * @fileOverview An AI agent that parses raw text from a legal document and converts it to HTML.
 *
 * - parseLegalDocument - Converts document text to structured HTML.
 * - ParseLegalDocInput - Input type for the parseLegalDocument function.
 * - ParseLegalDocOutput - Return type for the parseLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseLegalDocInputSchema = z.object({
    documentContent: z
        .string()
        .describe('The raw text content extracted from an uploaded document (e.g., .txt, .docx, .pdf).'),
    documentType: z
        .string()
        .describe('The type of the legal document, which provides context for parsing (e.g., Privacy Policy, Terms & Conditions).'),
});
export type ParseLegalDocInput = z.infer<typeof ParseLegalDocInputSchema>;

const ParseLegalDocOutputSchema = z.object({
  htmlContent: z.string().describe('The structured HTML content generated from the raw document text.'),
});
export type ParseLegalDocOutput = z.infer<typeof ParseLegalDocOutputSchema>;

export async function parseLegalDocument(input: ParseLegalDocInput): Promise<ParseLegalDocOutput> {
  return parseLegalDocFlow(input);
}

const parseLegalDocPrompt = ai.definePrompt({
  name: 'parseLegalDocPrompt',
  input: {schema: ParseLegalDocInputSchema},
  output: {schema: ParseLegalDocOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert legal document formatter. Your task is to take the raw text content from a document and convert it into clean, well-structured HTML.

  The user will provide the raw text and the type of document. Use the document type to understand the context.

  Analyze the text to identify headings, subheadings, paragraphs, lists (ordered and unordered), and any other structural elements.
  
  Format the output using appropriate HTML tags:
  - Use <h1> for the main title.
  - Use <h2>, <h3>, etc., for sections and subsections.
  - Use <p> for paragraphs.
  - Use <ul> and <li> for bullet points.
  - Use <ol> and <li> for numbered lists.
  - Use <strong> and <em> for bold and italic text where appropriate.

  Do not add any styles or classes to the HTML tags. Just produce clean, semantic HTML.

  Document Type: {{{documentType}}}
  Raw Content to Parse:
  {{{documentContent}}}
  `,
});

const parseLegalDocFlow = ai.defineFlow(
  {
    name: 'parseLegalDocFlow',
    inputSchema: ParseLegalDocInputSchema,
    outputSchema: ParseLegalDocOutputSchema,
  },
  async input => {
    const {output} = await parseLegalDocPrompt(input);
    return output!;
  }
);
