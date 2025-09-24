
'use server';

/**
 * @fileOverview An AI agent that generates a secure One-Time Password (OTP).
 *
 * - generateOtp - Creates a 6-digit numeric OTP.
 * - GenerateOtpOutput - The return type for the generateOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateOtpOutputSchema = z.object({
  otp: z.string().length(6).describe('A secure, random, 6-digit numeric code.'),
});
export type GenerateOtpOutput = z.infer<typeof GenerateOtpOutputSchema>;

export async function generateOtp(): Promise<GenerateOtpOutput> {
  return generateOtpFlow();
}

const generateOtpPrompt = ai.definePrompt({
  name: 'generateOtpPrompt',
  output: { schema: GenerateOtpOutputSchema },
  prompt: `You are an expert in generating secure, random codes. 
  
  Your task is to generate a single, secure, 6-digit One-Time Password (OTP).
  
  The OTP must be composed of only numeric digits (0-9).
  Ensure the generated OTP is as random as possible.
  `,
});

const generateOtpFlow = ai.defineFlow(
  {
    name: 'generateOtpFlow',
    outputSchema: GenerateOtpOutputSchema,
  },
  async () => {
    const { output } = await generateOtpPrompt();
    return output!;
  }
);
