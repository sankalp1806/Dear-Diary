'use server';
/**
 * @fileOverview Analyzes journal entries to find sources of negativity.
 *
 * - getNegativeSourceInsight - A function that provides the insight.
 * - GetNegativeSourceInsightInput - The input type for the function.
 * - GetNegativeSourceInsightOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetNegativeSourceInsightInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('A JSON string of journal entries to analyze.'),
});
export type GetNegativeSourceInsightInput = z.infer<
  typeof GetNegativeSourceInsightInputSchema
>;

const GetNegativeSourceInsightOutputSchema = z.object({
  sources: z
    .array(z.string())
    .describe('A list of identified sources of negativity in bullet points.'),
});
export type GetNegativeSourceInsightOutput = z.infer<
  typeof GetNegativeSourceInsightOutputSchema
>;

export async function getNegativeSourceInsight(
  input: GetNegativeSourceInsightInput
): Promise<GetNegativeSourceInsightOutput> {
  return getNegativeSourceInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNegativeSourceInsightPrompt',
  input: {schema: GetNegativeSourceInsightInputSchema},
  output: {schema: GetNegativeSourceInsightOutputSchema},
  prompt: `You are an analytical AI assistant. Review the user's journal entries and identify the primary sources of their negative feelings.

  List the sources as bullet points. Be specific and base your analysis on the provided text.

  Journal Entries:
  {{{journalEntries}}}
  `,
});

const getNegativeSourceInsightFlow = ai.defineFlow(
  {
    name: 'getNegativeSourceInsightFlow',
    inputSchema: GetNegativeSourceInsightInputSchema,
    outputSchema: GetNegativeSourceInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
