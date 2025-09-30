
'use server';

/**
 * @fileOverview An AI agent that suggests a selling price for a product.
 *
 * - suggestProductPrice - Analyzes product details and market data to suggest a price.
 * - SuggestPriceInput - Input type for the suggestProductPrice function.
 * - SuggestPriceOutput - Return type for the suggestProductPrice function.
 */

import {ai} from '@/ai/genkit';
import { SuggestPriceInputSchema, SuggestPriceOutputSchema, type SuggestPriceInput, type SuggestPriceOutput } from '@/lib/product-schema';


export async function suggestProductPrice(input: SuggestPriceInput): Promise<SuggestPriceOutput> {
  return suggestPriceFlow(input);
}

const suggestPricePrompt = ai.definePrompt({
  name: 'suggestPricePrompt',
  input: {schema: SuggestPriceInputSchema},
  output: {schema: SuggestPriceOutputSchema},
  model: 'googleai/gemini-pro',
  prompt: `You are a highly experienced e-commerce pricing strategist for the Indian market. Your task is to suggest an optimal selling price for a new product.

  Analyze the following product details:
  - Product Name: {{{productName}}}
  - Description: {{{description}}}
  - Category: {{{category}}}
  - Main Image: {{media url=mainImage}}
  - Purchase Price (Cost): ₹{{{purchasePrice}}}

  Your process must be as follows:
  1.  **Market Research**: Based on the product name, description, category, and image, perform a quick analysis of similar products available on the Indian e-commerce market. Identify the typical price range for such items.
  2.  **Overhead Estimation**: Estimate the additional costs associated with selling this product. This includes a standard estimation for:
      - Packaging: ~3% of purchase price
      - Shipping & Logistics: ~8% of purchase price
      - Marketing & Promotions: ~15% of purchase price
      - Platform Fees & Warehousing: ~5% of purchase price
  3.  **Margin Calculation**: Calculate a target selling price that includes a healthy but competitive profit margin (aim for 20-35% net margin after all costs).
  4.  **Final Price Suggestion**: Round the final calculated price to a psychologically appealing number (e.g., ending in 99, 49, or 0). The final suggested price MUST be greater than the purchase price plus all estimated overheads.

  Return only the final suggested selling price.
  `,
});

const suggestPriceFlow = ai.defineFlow(
  {
    name: 'suggestPriceFlow',
    inputSchema: SuggestPriceInputSchema,
    outputSchema: SuggestPriceOutputSchema,
  },
  async input => {
    const {output} = await suggestPricePrompt(input);
    return output!;
  }
);
