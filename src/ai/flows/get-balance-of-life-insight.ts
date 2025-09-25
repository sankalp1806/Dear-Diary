'use server';
/**
 * @fileOverview Analyzes journal entries to provide a "balance of life" insight.
 *
 * - getBalanceOfLifeInsight - A function that provides the insight.
 * - GetBalanceOfLifeInsightInput - The input type for the function.
 * - GetBalanceOfLifeInsightOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetBalanceOfLifeInsightInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('A JSON string of journal entries to analyze.'),
});
export type GetBalanceOfLifeInsightInput = z.infer<
  typeof GetBalanceOfLifeInsightInputSchema
>;

const GetBalanceOfLifeInsightOutputSchema = z.object({
  insight: z
    .string()
    .describe(
      'A paragraph summarizing the balance of life based on the journal entries.'
    ),
});
export type GetBalanceOfLifeInsightOutput = z.infer<
  typeof GetBalanceOfLifeInsightOutputSchema
>;

export async function getBalanceOfLifeInsight(
  input: GetBalanceOfLifeInsightInput
): Promise<GetBalanceOfLifeInsightOutput> {
  return getBalanceOfLifeInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getBalanceOfLifeInsightPrompt',
  input: {schema: GetBalanceOfLifeInsightInputSchema},
  output: {schema: GetBalanceOfLifeInsightOutputSchema},
  prompt: `You are a compassionate AI assistant. Analyze the following journal entries and provide a summary of the user's "balance of life".

  Consider their emotions, activities, and reflections. Provide a gentle, encouraging, and insightful paragraph.

  Journal Entries:
  {{{journalEntries}}}
  `,
});

const getBalanceOfLifeInsightFlow = ai.defineFlow(
  {
    name: 'getBalanceOfLifeInsightFlow',
    inputSchema: GetBalanceOfLifeInsightInputSchema,
    outputSchema: GetBalanceOfLifeInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
