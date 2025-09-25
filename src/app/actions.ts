'use server';

import { z } from 'zod';
import { categorizeJournalEntry } from '@/ai/flows/categorize-journal-entries';
import { provideEmotionalInsights } from '@/ai/flows/provide-emotional-insights';
import { generateSelfReflectionPrompts } from '@/ai/flows/generate-self-reflection-prompts';
import type { AnalysisState, PromptsState } from '@/lib/types';

const journalEntrySchema = z.object({
  entry: z.string().min(10, { message: 'Entry must be at least 10 characters long to provide meaningful insights.' }),
});

export async function analyzeEntryAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const validatedFields = journalEntrySchema.safeParse({
    entry: formData.get('entry'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      data: null,
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
      timestamp: Date.now(),
    };
  }

  const entryText = validatedFields.data.entry;
  const userId = 'user-123'; // Mock user ID for personalization

  try {
    const [categoriesResult, insightsResult] = await Promise.all([
      categorizeJournalEntry({ entryText }),
      provideEmotionalInsights({ journalEntry: entryText, userId }),
    ]);

    return {
      success: true,
      data: {
        categories: categoriesResult.categories,
        insights: insightsResult,
      },
      error: null,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error in analyzeEntryAction:', error);
    return {
      success: false,
      data: null,
      error: 'An unexpected error occurred while analyzing your entry. Please try again later.',
      timestamp: Date.now(),
    };
  }
}

export async function generatePromptsAction(
  prevState: PromptsState,
  formData?: FormData
): Promise<PromptsState> {
  const userInput = formData?.get('entry')?.toString() || 'a recent feeling of mine';

  try {
    const promptsResult = await generateSelfReflectionPrompts({ userInput });
    return {
      success: true,
      data: promptsResult,
      error: null,
    };
  } catch (error) {
    console.error('Error in generatePromptsAction:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to generate new prompts. Please try again.',
    };
  }
}

export async function getSentimentForEntry(entryText: string) {
    if (!entryText || entryText.length < 10) {
        return { overallSentiment: 'neutral' };
    }
    try {
        const insights = await provideEmotionalInsights({
            journalEntry: entryText,
            userId: 'user-123', // Mock user ID
        });
        return insights;
    } catch (error) {
        console.error("Error getting sentiment:", error);
        // Return neutral sentiment as a fallback
        return { overallSentiment: 'neutral' };
    }
}
