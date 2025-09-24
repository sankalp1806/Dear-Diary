// ProvideEmotionalInsights Story: As a user, I want the app to analyze my journal entries and provide personalized insights about my emotions so that I can better understand my emotional patterns.

'use server';

/**
 * @fileOverview AI-driven insights from journal entries.
 *
 * - provideEmotionalInsights - A function to analyze journal entries and provide personalized emotional insights.
 * - ProvideEmotionalInsightsInput - The input type for the provideEmotionalInsights function.
 * - ProvideEmotionalInsightsOutput - The return type for the provideEmotionalInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideEmotionalInsightsInputSchema = z.object({
  journalEntry: z.string().describe('The journal entry to analyze.'),
  userId: z.string().describe('The ID of the user who wrote the journal entry.'),
});
export type ProvideEmotionalInsightsInput = z.infer<typeof ProvideEmotionalInsightsInputSchema>;

const ProvideEmotionalInsightsOutputSchema = z.object({
  overallSentiment: z.string().describe('The overall sentiment of the journal entry (e.g., positive, negative, neutral).'),
  keyEmotions: z.array(z.string()).describe('A list of key emotions expressed in the journal entry.'),
  emotionalPatterns: z.string().describe('A description of any emotional patterns identified in the journal entry.'),
  personalizedInsights: z.string().describe('Personalized insights based on the emotional analysis.'),
});
export type ProvideEmotionalInsightsOutput = z.infer<typeof ProvideEmotionalInsightsOutputSchema>;

export async function provideEmotionalInsights(input: ProvideEmotionalInsightsInput): Promise<ProvideEmotionalInsightsOutput> {
  return provideEmotionalInsightsFlow(input);
}

const provideEmotionalInsightsPrompt = ai.definePrompt({
  name: 'provideEmotionalInsightsPrompt',
  input: {schema: ProvideEmotionalInsightsInputSchema},
  output: {schema: ProvideEmotionalInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes journal entries and provides personalized insights about the user's emotions.

  Analyze the following journal entry for emotional content, sentiment, and patterns. Provide personalized insights to help the user better understand their emotional state.

  Journal Entry:
  {{journalEntry}}

  Consider the user's ID: {{userId}}
  Output Schema: {{{outputSchema}}}

  Provide your analysis in the format specified by the output schema.`,
});

const provideEmotionalInsightsFlow = ai.defineFlow(
  {
    name: 'provideEmotionalInsightsFlow',
    inputSchema: ProvideEmotionalInsightsInputSchema,
    outputSchema: ProvideEmotionalInsightsOutputSchema,
  },
  async input => {
    const {output} = await provideEmotionalInsightsPrompt(input);
    return output!;
  }
);
