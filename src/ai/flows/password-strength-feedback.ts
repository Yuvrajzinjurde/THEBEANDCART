'use server';

/**
 * @fileOverview An AI agent that provides real-time feedback on password strength.
 *
 * - getPasswordStrengthFeedback - A function that takes a password as input and returns feedback on its strength.
 * - PasswordStrengthFeedbackInput - The input type for the getPasswordStrengthFeedback function.
 * - PasswordStrengthFeedbackOutput - The return type for the getPasswordStrengthFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PasswordStrengthFeedbackInputSchema = z.object({
  password: z
    .string()
    .describe('The password to evaluate for strength.'),
});
export type PasswordStrengthFeedbackInput = z.infer<typeof PasswordStrengthFeedbackInputSchema>;

const PasswordStrengthFeedbackOutputSchema = z.object({
  strength: z.string().describe('A textual description of the password strength (e.g., Weak, Moderate, Strong).'),
  feedback: z.string().describe('Specific suggestions for improving the password.'),
});
export type PasswordStrengthFeedbackOutput = z.infer<typeof PasswordStrengthFeedbackOutputSchema>;

export async function getPasswordStrengthFeedback(input: PasswordStrengthFeedbackInput): Promise<PasswordStrengthFeedbackOutput> {
  return passwordStrengthFeedbackFlow(input);
}

const passwordStrengthFeedbackPrompt = ai.definePrompt({
  name: 'passwordStrengthFeedbackPrompt',
  input: {schema: PasswordStrengthFeedbackInputSchema},
  output: {schema: PasswordStrengthFeedbackOutputSchema},
  prompt: `You are an AI assistant that provides feedback on password strength.

  Evaluate the password provided and provide a strength rating (Weak, Moderate, Strong) and actionable feedback for improving the password.

  Password: {{{password}}} `,
});

const passwordStrengthFeedbackFlow = ai.defineFlow(
  {
    name: 'passwordStrengthFeedbackFlow',
    inputSchema: PasswordStrengthFeedbackInputSchema,
    outputSchema: PasswordStrengthFeedbackOutputSchema,
  },
  async input => {
    const {output} = await passwordStrengthFeedbackPrompt(input);
    return output!;
  }
);
