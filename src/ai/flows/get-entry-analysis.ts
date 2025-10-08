'use server';
/**
 * @fileOverview Flow to analyze a journal entry by calling a Python API.
 *
 * - getEntryAnalysis - A function that gets analysis for an entry.
 * - GetEntryAnalysisInput - The input type for the function.
 * - GetEntryAnalysisOutput - The return type for the function.
 */

import {z} from 'genkit';

const FASTAPI_URL = 'http://127.0.0.1:8000';

const GetEntryAnalysisInputSchema = z.object({
  entryText: z.string().describe('The text content of the journal entry.'),
});
export type GetEntryAnalysisInput = z.infer<
  typeof GetEntryAnalysisInputSchema
>;

const GetEntryAnalysisOutputSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  emojis: z.array(z.string()),
});
export type GetEntryAnalysisOutput = z.infer<
  typeof GetEntryAnalysisOutputSchema
>;

export async function getEntryAnalysis(
  input: GetEntryAnalysisInput
): Promise<GetEntryAnalysisOutput> {
  try {
    const response = await fetch(`${FASTAPI_URL}/process-diary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diary_entry: input.entryText }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    return GetEntryAnalysisOutputSchema.parse(result);
  } catch (e: any) {
    console.error("Error calling FastAPI /process-diary endpoint:", e);
    throw new Error(`Failed to get entry analysis: ${e.message}`);
  }
}
