import type { CategorizeJournalEntryOutput } from "@/ai/flows/categorize-journal-entries";
import type { ProvideEmotionalInsightsOutput } from "@/ai/flows/provide-emotional-insights";
import type { GenerateSelfReflectionPromptsOutput } from "@/ai/flows/generate-self-reflection-prompts";

export type AnalysisState = {
  success: boolean;
  data: {
    categories: CategorizeJournalEntryOutput['categories'];
    insights: ProvideEmotionalInsightsOutput;
  } | null;
  error: string | null;
  timestamp: number;
} | null;


export type PromptsState = {
    success: boolean;
    data: GenerateSelfReflectionPromptsOutput | null;
    error: string | null;
} | null;
