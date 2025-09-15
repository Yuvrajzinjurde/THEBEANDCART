
'use server';

/**
 * @fileOverview An AI agent that automatically fills product details based on a product name.
 *
 * - autofillProductDetails - Generates product details from a product name.
 * - AutofillProductInput - Input type for the autofillProductDetails function.
 * - AutofillProductOutput - Return type for the autofillProductDetails function.
 */

import {ai} from '@/ai/genkit';
import { AutofillProductInputSchema, AutofillProductOutputSchema, type AutofillProductInput, type AutofillProductOutput } from '@/lib/product-schema';


export async function autofillProductDetails(input: AutofillProductInput): Promise<AutofillProductOutput> {
  return autofillProductFlow(input);
}

const autofillProductPrompt = ai.definePrompt({
  name: 'autofillProductPrompt',
  input: {schema: AutofillProductInputSchema},
  output: {schema: AutofillProductOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an expert e-commerce catalog manager. Your task is to generate complete and realistic product details based on just a product name.

  The generated description should be engaging, SEO-optimized, and highlight key features.
  The pricing should be realistic for the given product. The MRP must be higher than the selling price to show a discount.
  Pick the most appropriate category from the list provided in the output schema.
  
  Generate all details for the following product:
  Product Name: {{{productName}}}
  `,
});

const autofillProductFlow = ai.defineFlow(
  {
    name: 'autofillProductFlow',
    inputSchema: AutofillProductInputSchema,
    outputSchema: AutofillProductOutputSchema,
  },
  async input => {
    const {output} = await autofillProductPrompt(input);
    return output!;
  }
);

