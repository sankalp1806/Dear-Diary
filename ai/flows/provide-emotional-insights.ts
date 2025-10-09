// ProvideEmotionalInsights Story: As a user, I want the app to analyze my journal entries and provide personalized insights about my emotions so that I can better understand my emotional patterns.

'use server';

/**
 * @fileOverview AI-driven insights from journal entries.
 *
 * - provideEmotionalInsights - A function to analyze journal entries and provide personalized emotional insights.
 * - ProvideEmotionalInsightsInput - The input type for the provideEmotionalinsights function.
 * - ProvideEmotionalInsightsOutput - The return type for the provideEmotionalinsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideEmotionalInsightsInputSchema = z.object({
  journalEntry: z.string().describe('The journal entry to analyze.'),
  userId: z.string().describe('The ID of the user who wrote the journal entry.'),
});
export type ProvideEmotionalInsightsInput = z.infer<typeof ProvideEmotionalInsightsInputSchema>;

const ProvideEmotionalInsightsOutputSchema = z.object({
  emotion: z.enum([
    'Happy',
    'Excited',
    'Grateful',
    'Content',
    'Loving',
    'Romantic',
    'Amused',
    'Joyful',
    'Optimistic',
    'Proud',
    'Neutral',
    'Sad',
    'Angry',
    'Anxious',
    'Worried',
    'Stressed',
    'Tired',
    'Confused',
    'Lonely',
    'Guilty',
    'Disappointed',
  ]).describe('The dominant emotion conveyed in the journal entry.'),
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
  prompt: `You are an expert emotion detection AI. Analyze the following journal entry and identify the single, most dominant emotion from the provided list.

  Journal Entry:
  {{journalEntry}}

  Your response must be in the format specified by the output schema.
  The primary 'emotion' field should be your main focus. Also provide the other fields as requested by the schema.`,
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
