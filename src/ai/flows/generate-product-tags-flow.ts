
'use server';

/**
 * @fileOverview An AI agent that generates product tags based on name and description.
 *
 * - generateProductTags - Generates relevant tags for a product.
 * - GenerateTagsInput - Input type for the generateProductTags function.
 * - GenerateTagsOutput - Return type for the generateProductTags function.
 */

import {ai} from '@/ai/genkit';
import { GenerateTagsInputSchema, GenerateTagsOutputSchema, type GenerateTagsInput, type GenerateTagsOutput } from '@/lib/product-schema';


export async function generateProductTags(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  return generateTagsFlow(input);
}

const generateTagsPrompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: {schema: GenerateTagsInputSchema},
  output: {schema: GenerateTagsOutputSchema},
  model: 'gemini-pro',
  prompt: `You are an e-commerce expert who is great at creating relevant product keywords.
  Based on the product name and description below, generate an array of 5 to 7 relevant, single-word keywords that can be used to find similar products.
  Do not use generic tags like "product" or "item". Focus on specific attributes, materials, use cases, or styles.

  Product Name: {{{productName}}}
  Description: {{{description}}}
  `,
});

const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: GenerateTagsOutputSchema,
  },
  async input => {
    const {output} = await generateTagsPrompt(input);
    return output!;
  }
);
