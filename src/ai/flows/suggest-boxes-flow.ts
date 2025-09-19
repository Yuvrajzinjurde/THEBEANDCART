
'use server';

/**
 * @fileOverview An AI agent that suggests hamper boxes based on an occasion.
 *
 * - suggestBoxes - Suggests suitable boxes for a hamper.
 * - SuggestBoxesInput - Input type for the function.
 * - SuggestBoxesOutput - Return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BoxInfoSchema = z.object({
    id: z.string().describe('The unique ID of the box.'),
    name: z.string().describe('The name of the box.'),
    description: z.string().describe('The description of the box.'),
    type: z.string().describe('The type of packaging (e.g., "box" or "bag").'),
});

const SuggestBoxesInputSchema = z.object({
  occasion: z.string().describe('The occasion for which the hamper is being created.'),
  boxes: z.array(BoxInfoSchema).describe('A list of all available boxes and bags.'),
});
export type SuggestBoxesInput = z.infer<typeof SuggestBoxesInputSchema>;

const SuggestBoxesOutputSchema = z.object({
  suggestedBoxIds: z.array(z.string()).describe('An array of IDs for the 3-5 most suitable boxes for the occasion.'),
});
export type SuggestBoxesOutput = z.infer<typeof SuggestBoxesOutputSchema>;


export async function suggestBoxes(input: SuggestBoxesInput): Promise<SuggestBoxesOutput> {
  return suggestBoxesFlow(input);
}

const suggestBoxesPrompt = ai.definePrompt({
  name: 'suggestBoxesPrompt',
  input: { schema: SuggestBoxesInputSchema },
  output: { schema: SuggestBoxesOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert gift curator. Your task is to recommend the best packaging options for a gift hamper based on a specific occasion.

Analyze the user's selected occasion: {{{occasion}}}

Here is a list of available boxes and bags:
{{#each boxes}}
- ID: {{id}}
  Name: {{name}}
  Description: {{description}}
  Type: {{type}}
{{/each}}

Based on the occasion, choose the 3 to 5 most appropriate packaging options from the list. Consider the description and type (box vs. bag) to make your recommendations. For example:
- A "Birthday" might call for a "Celebration Surprise Box".
- A "Corporate Gift" might suit a "Luxury Boutique Bag" or "Minimalist White Box".
- "Jewelry" should be in a "Premium Jewelry Box".

Return your answer as an array of the chosen box IDs in the 'suggestedBoxIds' field.
  `,
});

const suggestBoxesFlow = ai.defineFlow(
  {
    name: 'suggestBoxesFlow',
    inputSchema: SuggestBoxesInputSchema,
    outputSchema: SuggestBoxesOutputSchema,
  },
  async input => {
    const { output } = await suggestBoxesPrompt(input);
    return output!;
  }
);
