
'use server';

/**
 * @fileOverview An AI agent that generates SEO-optimized product descriptions.
 *
 * - getSEODescription - Generates a product description based on the product name.
 * - SEODescriptionInput - Input type for the getSEODescription function.
 * - SEODescriptionOutput - Return type for the getSEODescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SEODescriptionInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product for which to generate a description.'),
});
export type SEODescriptionInput = z.infer<typeof SEODescriptionInputSchema>;

const SEODescriptionOutputSchema = z.object({
  description: z.string().describe('The generated SEO-optimized product description.'),
});
export type SEODescriptionOutput = z.infer<typeof SEODescriptionOutputSchema>;

export async function getSEODescription(input: SEODescriptionInput): Promise<SEODescriptionOutput> {
  return seoDescriptionFlow(input);
}

const seoDescriptionPrompt = ai.definePrompt({
  name: 'seoDescriptionPrompt',
  input: {schema: SEODescriptionInputSchema},
  output: {schema: SEODescriptionOutputSchema},
  model: 'googleai/gemini-pro',
  prompt: `You are an expert copywriter specializing in e-commerce. Your task is to generate a compelling, SEO-optimized product description.

  The description should be engaging, highlight key features and benefits, and include relevant keywords naturally. Structure it with clear headings or bullet points. The tone should be persuasive and professional.

  Generate a description for the following product:
  Product Name: {{{productName}}}
  `,
});

const seoDescriptionFlow = ai.defineFlow(
  {
    name: 'seoDescriptionFlow',
    inputSchema: SEODescriptionInputSchema,
    outputSchema: SEODescriptionOutputSchema,
  },
  async input => {
    const {output} = await seoDescriptionPrompt(input);
    return output!;
  }
);
