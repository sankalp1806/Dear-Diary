'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating tailored prompts to encourage deeper self-reflection.
 *
 * It includes:
 * - generateSelfReflectionPrompts: An async function that takes user input and returns self-reflection prompts.
 * - GenerateSelfReflectionPromptsInput: The input type for the generateSelfReflectionPrompts function.
 * - GenerateSelfReflectionPromptsOutput: The output type for the generateSelfReflectionPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSelfReflectionPromptsInputSchema = z.object({
  userInput: z
    .string()
    .describe(
      'The user input, containing thoughts, feelings, or experiences to reflect upon.'
    ),
  userHistory: z
    .string()
    .optional()
    .describe(
      'Optional user history, providing context for generating more relevant prompts.'
    ),
});

export type GenerateSelfReflectionPromptsInput = z.infer<
  typeof GenerateSelfReflectionPromptsInputSchema
>;

const GenerateSelfReflectionPromptsOutputSchema = z.object({
  prompts: z
    .array(z.string())
    .describe('An array of self-reflection prompts tailored to the user input.'),
});

export type GenerateSelfReflectionPromptsOutput = z.infer<
  typeof GenerateSelfReflectionPromptsOutputSchema
>;

export async function generateSelfReflectionPrompts(
  input: GenerateSelfReflectionPromptsInput
): Promise<GenerateSelfReflectionPromptsOutput> {
  return generateSelfReflectionPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSelfReflectionPromptsPrompt',
  input: {
    schema: GenerateSelfReflectionPromptsInputSchema,
  },
  output: {
    schema: GenerateSelfReflectionPromptsOutputSchema,
  },
  prompt: `You are an AI assistant designed to generate self-reflection prompts.

  Based on the user's input and history, create a list of thought-provoking prompts to encourage deeper self-reflection.

  User Input: {{{userInput}}}
  User History: {{{userHistory}}}

  Prompts:`, // Handlebars syntax
});

const generateSelfReflectionPromptsFlow = ai.defineFlow(
  {
    name: 'generateSelfReflectionPromptsFlow',
    inputSchema: GenerateSelfReflectionPromptsInputSchema,
    outputSchema: GenerateSelfReflectionPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
