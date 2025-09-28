'use server';
/**
 * @fileOverview Categorizes journal entries into predefined categories.
 *
 * - categorizeJournalEntry - A function that categorizes a journal entry.
 * - CategorizeJournalEntryInput - The input type for the categorizeJournalEntry function.
 * - CategorizeJournalEntryOutput - The return type for the categorizeJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeJournalEntryInputSchema = z.object({
  entryText: z.string().describe('The text content of the journal entry.'),
});
export type CategorizeJournalEntryInput = z.infer<
  typeof CategorizeJournalEntryInputSchema
>;

const CategorizeJournalEntryOutputSchema = z.object({
  categories: z
    .array(
      z
        .enum(['feelings', 'memories', 'dreams', 'other'])
        .describe('Category of journal entry')
    )
    .describe('The categories that the journal entry belongs to.'),
});

export type CategorizeJournalEntryOutput = z.infer<
  typeof CategorizeJournalEntryOutputSchema
>;

export async function categorizeJournalEntry(
  input: CategorizeJournalEntryInput
): Promise<CategorizeJournalEntryOutput> {
  return categorizeJournalEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeJournalEntryPrompt',
  input: {schema: CategorizeJournalEntryInputSchema},
  output: {schema: CategorizeJournalEntryOutputSchema},
  prompt: `You are a helpful AI assistant that categorizes journal entries.

  Given the following journal entry, determine which of the following categories it belongs to: feelings, memories, dreams, other.
  A journal entry can belong to multiple categories.

  Journal Entry: {{{entryText}}}
  Categories:`, // Ensure that the output is in a structured JSON format.
});

const categorizeJournalEntryFlow = ai.defineFlow(
  {
    name: 'categorizeJournalEntryFlow',
    inputSchema: CategorizeJournalEntryInputSchema,
    outputSchema: CategorizeJournalEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
