'use server';

import { z } from 'zod';
import { categorizeJournalEntry } from '@/ai/flows/categorize-journal-entries';
import { provideEmotionalInsights, type ProvideEmotionalInsightsOutput } from '@/ai/flows/provide-emotional-insights';
import { generateSelfReflectionPrompts } from '@/ai/flows/generate-self-reflection-prompts';
import { getBalanceOfLifeInsight } from '@/ai/flows/get-balance-of-life-insight';
import { getNegativeSourceInsight } from '@/ai/flows/get-negative-source-insight';
import { getBadMoodTriggersInsight } from '@/ai/flows/get-bad-mood-triggers-insight';
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

export async function getSentimentForEntry(entryText: string): Promise<ProvideEmotionalInsightsOutput | { emotion: string, overallSentiment: string }> {
    if (!entryText || entryText.length < 10) {
        return { emotion: 'Neutral', overallSentiment: 'neutral' };
    }
    try {
        const insights = await provideEmotionalInsights({
            journalEntry: entryText,
            userId: 'user-123', // Mock user ID
        });
        return insights;
    } catch (error) {
        console.error("Error getting sentiment:", error);
        // Return neutral as a fallback
        return { emotion: 'Neutral', overallSentiment: 'neutral' };
    }
}

export async function getBalanceInsightAction(journalEntries: string) {
    try {
        const result = await getBalanceOfLifeInsight({ journalEntries });
        return { success: true, data: result.insight };
    } catch (error) {
        console.error("Error in getBalanceInsightAction:", error);
        return { success: false, error: "Failed to generate balance insight." };
    }
}

export async function getNegativityInsightAction(journalEntries: string) {
    try {
        const result = await getNegativeSourceInsight({ journalEntries });
        return { success: true, data: result.sources };
    } catch (error) {
        console.error("Error in getNegativityInsightAction:", error);
        return { success: false, error: "Failed to generate negativity insight." };
    }
}

export async function getTriggersInsightAction(journalEntries: string) {
    try {
        const result = await getBadMoodTriggersInsight({ journalEntries });
        return { success: true, data: result.triggers };
    } catch (error) {
        console.error("Error in getTriggersInsightAction:", error);
        return { success: false, error: "Failed to generate mood triggers insight." };
    }
}
