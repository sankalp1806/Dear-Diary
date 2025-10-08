'use server';

import { z } from 'zod';
import { categorizeJournalEntry } from '@/ai/flows/categorize-journal-entries';
import { provideEmotionalInsights, type ProvideEmotionalInsightsOutput } from '@/ai/flows/provide-emotional-insights';
import { generateSelfReflectionPrompts } from '@/ai/flows/generate-self-reflection-prompts';
import { getBalanceOfLifeInsight } from '@/ai/flows/get-balance-of-life-insight';
import { getNegativeSourceInsight } from '@/ai/flows/get-negative-source-insight';
import { getBadMoodTriggersInsight } from '@/ai/flows/get-bad-mood-triggers-insight';
import { continueConversation } from '@/ai/flows/continue-conversation';
import { summarizeConversation } from '@/ai/flows/summarize-conversation';
import { getEntryAnalysis } from '@/ai/flows/get-entry-analysis';
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
  
  try {
    const analysisResult = await getEntryAnalysis({ entryText });

    // The new flow gives us summary, insights, and emojis.
    // We need to adapt this to the existing AnalysisState structure.
    // We will use the first emoji as the primary emotion indicator and the summary.
    const insights: ProvideEmotionalInsightsOutput = {
      emotion: analysisResult.emojis[0] || 'Neutral',
      overallSentiment: 'neutral', // This could be derived from the summary if needed.
      keyEmotions: analysisResult.emojis,
      emotionalPatterns: analysisResult.summary, // Using summary for patterns
      personalizedInsights: analysisResult.insights.join('\n'),
    };
    
    return {
      success: true,
      data: {
        categories: ['feelings'], // We can default this or enhance the python script
        insights: insights,
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

export async function getSentimentForEntry(entryText: string): Promise<ProvideEmotionalInsightsOutput & { summary?: string, insights?: string[] }> {
    if (!entryText || entryText.length < 10) {
        return { emotion: 'Neutral', overallSentiment: 'neutral', keyEmotions: [], emotionalPatterns: '', personalizedInsights: '' };
    }
    try {
        const analysis = await getEntryAnalysis({ entryText });
        return {
            emotion: analysis.emojis[0] || 'Neutral',
            overallSentiment: 'neutral', // You could refine this
            summary: analysis.summary,
            insights: analysis.insights,
            keyEmotions: analysis.emojis,
            emotionalPatterns: '',
            personalizedInsights: analysis.insights.join('\n')
        };
    } catch (error) {
        console.error("Error getting sentiment:", error);
        // Return neutral as a fallback
        return { emotion: 'Neutral', overallSentiment: 'neutral', keyEmotions: [], emotionalPatterns: '', personalizedInsights: '' };
    }
}

export async function getBalanceInsightAction(journalEntries: string) {
    try {
        const result = await getBalanceOfLifeInsight({ journalEntries });
        return { success: true, data: result };
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

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export async function continueConversationAction(
  message: string
) {
  try {
    const result = await continueConversation({ message });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in continueConversationAction:", error);
    return { success: false, error: error.message || "Failed to get AI response." };
  }
}


export async function getConversationSummaryAction(
  conversation: ChatMessage[]
): Promise<string> {
    if (conversation.length === 0) {
        return "Chat with AI";
    }
    // The summary is now generated when the entry is processed.
    // This function can be simplified or used to call a different summary endpoint if needed.
    const userEntries = conversation.filter(m => m.sender === 'user').map(m => m.text).join('\n');
    try {
        const result = await summarizeConversation({ conversation: userEntries });
        return result.summary;
    } catch (error) {
        console.error('Error summarizing conversation:', error);
        // Fallback to a generic preview
        return "A conversation with Sparky.";
    }
}
