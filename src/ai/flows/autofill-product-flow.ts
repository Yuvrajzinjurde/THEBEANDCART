'use server';

/**
 * @fileOverview An AI agent that automatically fills product details based on a product name.
 *
 * - autofillProductDetails - Generates product details from a product name.
 * - AutofillProductInput - Input type for the autofillProductDetails function.
 * - AutofillProductOutput - Return type for the autofillProductDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CATEGORIES = [
    "Men Fashion", "Women Fashion", "Home & Living", "Kids & Toys",
    "Personal Care & Wellness", "Mobiles & Tablets", "Consumer Electronics",
    "Appliances", "Automotive", "Beauty & Personal Care", "Home Utility",
    "Kids", "Grocery", "Women", "Home & Kitchen", "Health & Wellness",
    "Beauty & Makeup", "Personal Care", "Men'S Grooming",
    "Craft & Office Supplies", "Sports & Fitness", "Automotive Accessories",
    "Pet Supplies", "Office Supplies & Stationery",
    "Industrial & Scientific Products", "Musical Instruments", "Books",
    "Eye Utility", "Bags, Luggage & Travel Accessories", "Mens Personal Care & Grooming"
];

export const AutofillProductInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product to generate details for.'),
});
export type AutofillProductInput = z.infer<typeof AutofillProductInputSchema>;

export const AutofillProductOutputSchema = z.object({
  description: z.string().describe('The generated SEO-optimized product description. Should be around 100-150 words.'),
  mrp: z.number().describe('The suggested Maximum Retail Price (MRP). Should be higher than the selling price.'),
  sellingPrice: z.number().describe('The suggested selling price.'),
  category: z.enum(CATEGORIES).describe('The most relevant product category from the provided list.'),
  brand: z.string().describe("The product's actual brand name (e.g., Nike, Sony, Apple)."),
  stock: z.number().describe('A suggested initial stock quantity, between 50 and 200.'),
});
export type AutofillProductOutput = z.infer<typeof AutofillProductOutputSchema>;

export async function autofillProductDetails(input: AutofillProductInput): Promise<AutofillProductOutput> {
  return autofillProductFlow(input);
}

const autofillProductPrompt = ai.definePrompt({
  name: 'autofillProductPrompt',
  input: {schema: AutofillProductInputSchema},
  output: {schema: AutofillProductOutputSchema},
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
