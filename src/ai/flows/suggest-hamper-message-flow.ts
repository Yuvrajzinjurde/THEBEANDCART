
'use server';

/**
 * @fileOverview An AI agent that suggests a personalized message for a gift hamper.
 *
 * - suggestHamperMessage - Generates a message based on occasion and products.
 * - SuggestHamperMessageInput - Input type for the function.
 * - SuggestHamperMessageOutput - Return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductInfoSchema = z.object({
    name: z.string().describe('The name of the product.'),
    description: z.string().describe('A brief description of the product.'),
});

export const SuggestHamperMessageInputSchema = z.object({
  occasion: z.string().describe('The occasion for the gift (e.g., Birthday, Anniversary).'),
  products: z.array(ProductInfoSchema).describe('A list of products included in the hamper.'),
});
export type SuggestHamperMessageInput = z.infer<typeof SuggestHamperMessageInputSchema>;

export const SuggestHamperMessageOutputSchema = z.object({
  message: z.string().describe('A short, creative, and context-aware message for the gift recipient.'),
});
export type SuggestHamperMessageOutput = z.infer<typeof SuggestHamperMessageOutputSchema>;

export async function suggestHamperMessage(input: SuggestHamperMessageInput): Promise<SuggestHamperMessageOutput> {
  return suggestHamperMessageFlow(input);
}

const suggestHamperMessagePrompt = ai.definePrompt({
  name: 'suggestHamperMessagePrompt',
  input: { schema: SuggestHamperMessageInputSchema },
  output: { schema: SuggestHamperMessageOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert gift-giver with a talent for writing heartfelt, witty, and creative messages. Your task is to generate a short message (around 20-30 words) for a gift hamper recipient.

The message should be tailored to the specific occasion and the items inside the hamper.

Occasion: {{{occasion}}}

Products in the hamper:
{{#each products}}
- Name: {{{this.name}}}
  Description: {{{this.description}}}
{{/each}}

Analyze the combination of the occasion and products to create a message that is thoughtful and relevant.

For example:
- If the occasion is "Birthday" and products are skincare items, you could say: "Happy Birthday! Hope this little box of goodies helps you relax, rejuvenate, and glow on your special day."
- If the occasion is "Anniversary" and products include gourmet coffee and cookies, you could suggest: "Happy Anniversary to my favorite person! Here's to many more cozy mornings and sweet moments together."

Generate a single, compelling message and return it in the 'message' field.
  `,
});

const suggestHamperMessageFlow = ai.defineFlow(
  {
    name: 'suggestHamperMessageFlow',
    inputSchema: SuggestHamperMessageInputSchema,
    outputSchema: SuggestHamperMessageOutputSchema,
  },
  async (input) => {
    const { output } = await suggestHamperMessagePrompt(input);
    return output!;
  }
);
