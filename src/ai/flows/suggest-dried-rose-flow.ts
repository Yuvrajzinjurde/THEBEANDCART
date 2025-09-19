
'use server';

/**
 * @fileOverview An AI agent that suggests adding a dried rose to a hamper.
 *
 * - suggestDriedRose - Suggests adding a dried rose based on the occasion.
 * - SuggestDriedRoseInput - Input type for the function.
 * - SuggestDriedRoseOutput - Return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestDriedRoseInputSchema = z.object({
  occasion: z
    .string()
    .describe('The occasion for which the hamper is being created (e.g., "Birthday", "Apology to Partner", "Anniversary").'),
});
export type SuggestDriedRoseInput = z.infer<typeof SuggestDriedRoseInputSchema>;

const SuggestDriedRoseOutputSchema = z.object({
  shouldSuggest: z.boolean().describe('Whether a dried rose should be suggested for this occasion.'),
  suggestionText: z.string().describe('A creative and context-aware text suggestion to show the user. If shouldSuggest is false, this should be an empty string.'),
});
export type SuggestDriedRoseOutput = z.infer<typeof SuggestDriedRoseOutputSchema>;

export async function suggestDriedRose(input: SuggestDriedRoseInput): Promise<SuggestDriedRoseOutput> {
  return suggestDriedRoseFlow(input);
}

const suggestDriedRosePrompt = ai.definePrompt({
  name: 'suggestDriedRosePrompt',
  input: { schema: SuggestDriedRoseInputSchema },
  output: { schema: SuggestDriedRoseOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a thoughtful gift-giving assistant. Your task is to decide whether to suggest adding a hand-pressed dried rose to a gift hamper based on the occasion.

  A dried rose symbolizes love, memory, and lasting beauty. It's a premium, thoughtful addition.

  Analyze the occasion: {{{occasion}}}

  - If the occasion is romantic, commemorative, or deeply personal (e.g., "Apology to Partner", "Anniversary", "Mother's Day", "Get Well Soon"), set 'shouldSuggest' to true.
  - If the occasion is more casual, corporate, or less personal (e.g., "Corporate Gift", "Thank You"), set 'shouldSuggest' to false.
  
  If you suggest it, craft a short, creative, and compelling 'suggestionText' (max 20 words) that explains why the rose fits the occasion. For example, for an Anniversary, you could say: "Add a timeless dried rose to symbolize your everlasting love." For an apology, "A pressed rose can speak volumes. Add one to convey your heartfelt feelings."
  
  If 'shouldSuggest' is false, return an empty string for 'suggestionText'.
  `,
});

const suggestDriedRoseFlow = ai.defineFlow(
  {
    name: 'suggestDriedRoseFlow',
    inputSchema: SuggestDriedRoseInputSchema,
    outputSchema: SuggestDriedRoseOutputSchema,
  },
  async input => {
    const { output } = await suggestDriedRosePrompt(input);
    return output!;
  }
);
