'use server';
/**
 * @fileOverview A friendly AI chatbot that uses a Python backend.
 *
 * - continueConversation - A function that continues a conversation with the user.
 * - ContinueConversationInput - The input type for the function.
 * - ContinueConversationOutput - The return type for the function.
 */
import {z} from 'genkit';

const FASTAPI_URL = 'http://127.0.0.1:8000';

const ContinueConversationInputSchema = z.object({
  message: z.string(),
});
export type ContinueConversationInput = z.infer<
  typeof ContinueConversationInputSchema
>;

const ContinueConversationOutputSchema = z.object({
  reply: z.string().describe("The AI's response to continue the conversation."),
});

export type ContinueConversationOutput = z.infer<
  typeof ContinueConversationOutputSchema
>;

export async function continueConversation(
  input: ContinueConversationInput
): Promise<ContinueConversationOutput> {
  try {
    const response = await fetch(`${FASTAPI_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input.message }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }
    
    const result = await response.json();
    return ContinueConversationOutputSchema.parse(result);

  } catch (e: any) {
    console.error("Error calling FastAPI /chat endpoint:", e);
    // If the server isn't running, provide a helpful message.
    if (e.cause?.code === 'ECONNREFUSED') {
       throw new Error("Could not connect to the AI chat service. Please ensure the Python server is running.");
    }
    throw new Error(`Failed to continue conversation: ${e.message}`);
  }
}
