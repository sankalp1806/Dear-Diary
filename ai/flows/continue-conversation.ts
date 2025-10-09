'use server';
/**
 * @fileOverview A friendly, Gen-Z AI chatbot for journaling.
 *
 * - continueConversation - A function that continues a conversation with the user.
 * - ContinueConversationInput - The input type for the function.
 * - ContinueConversationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
    sender: z.enum(['user', 'ai']),
    text: z.string(),
});

const ContinueConversationInputSchema = z.object({
  conversationHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
});
export type ContinueConversationInput = z.infer<
  typeof ContinueConversationInputSchema
>;

const ContinueConversationOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to continue the conversation.'),
});

export type ContinueConversationOutput = z.infer<
  typeof ContinueConversationOutputSchema
>;

export async function continueConversation(
  input: ContinueConversationInput
): Promise<ContinueConversationOutput> {
  return continueConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'continueConversationPrompt',
  input: {schema: ContinueConversationInputSchema},
  output: {schema: ContinueConversationOutputSchema},
  prompt: `You are a friendly and curious AI chat companion for a journaling app. Your name is Sparky. Your goal is to have a light, fun, and engaging conversation with the user to help them articulate their thoughts and feelings. Use a friendly, modern tone, incorporating GenZ slang where it feels natural (e.g., "spill the tea," "no cap," "bet," "vibe check," "it's giving...").

Your persona:
- You're like a cool, supportive friend.
- You're curious and ask open-ended questions.
- You're a little bit goofy and funny.
- You keep your responses relatively short and conversational.
- You are an expert at making the user feel comfortable.

Conversation rules:
1.  Start the conversation by asking a fun, open-ended question. Examples: "What's the vibe today?", "Spill the tea... what's been on your mind?", "Ayo, what's the secret for today?", "How we feelin' today? Give me the deets."
2.  Analyze the user's response and ask relevant follow-up questions.
3.  Keep the conversation flowing naturally. Don't just ask question after question. React to what they say.
4.  The output 'response' field should ONLY contain your response text, nothing else.

Here is the conversation history so far. The user's messages are from 'user', and yours are from 'ai'. Your next response should continue this conversation.
{{#if conversationHistory.length}}
Conversation History:
{{#each conversationHistory}}
{{this.sender}}: {{{this.text}}}
{{/each}}
{{/if}}

Your turn. What do you say next?
`,
});

const continueConversationFlow = ai.defineFlow(
  {
    name: 'continueConversationFlow',
    inputSchema: ContinueConversationInputSchema,
    outputSchema: ContinueConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
