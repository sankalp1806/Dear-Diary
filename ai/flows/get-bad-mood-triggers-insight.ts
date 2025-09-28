'use server';
/**
 * @fileOverview Analyzes journal entries to find triggers for bad moods.
 *
 * - getBadMoodTriggersInsight - A function that provides the insight.
 * - GetBadMoodTriggersInsightInput - The input type for the function.
 * - GetBadMoodTriggersInsightOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetBadMoodTriggersInsightInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('A JSON string of journal entries to analyze.'),
});
export type GetBadMoodTriggersInsightInput = z.infer<
  typeof GetBadMoodTriggersInsightInputSchema
>;

const GetBadMoodTriggersInsightOutputSchema = z.object({
  triggers: z
    .array(z.string())
    .describe('A list of identified triggers for bad moods in bullet points.'),
});
export type GetBadMoodTriggersInsightOutput = z.infer<
  typeof GetBadMoodTriggersInsightOutputSchema
>;

export async function getBadMoodTriggersInsight(
  input: GetBadMoodTriggersInsightInput
): Promise<GetBadMoodTriggersInsightOutput> {
  return getBadMoodTriggersInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getBadMoodTriggersInsightPrompt',
  input: {schema: GetBadMoodTriggersInsightInputSchema},
  output: {schema: GetBadMoodTriggersInsightOutputSchema},
  prompt: `You are a perceptive AI assistant. Read the following journal entries and identify recurring triggers that lead to bad moods for the user.

  List these triggers as bullet points. Focus on events, situations, or thoughts that precede a negative emotional state.

  Journal Entries:
  {{{journalEntries}}}
  `,
});

const getBadMoodTriggersInsightFlow = ai.defineFlow(
  {
    name: 'getBadMoodTriggersInsightFlow',
    inputSchema: GetBadMoodTriggersInsightInputSchema,
    outputSchema: GetBadMoodTriggersInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
