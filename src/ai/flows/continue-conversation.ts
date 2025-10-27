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
  userInput: z.string().describe('The initial journal entry to start the conversation.'),
});
export type ContinueConversationInput = z.infer<
  typeof ContinueConversationInputSchema
>;

const ContinueConversationOutputSchema = z.object({
  response: z.string().describe("The AI's response to start the conversation."),
});

export type ContinueConversationOutput = z.infer<
  typeof ContinueConversationOutputSchema
>;

export async function continueConversation(
  input: ContinueConversationInput
): Promise<ContinueConversationOutput> {
  try {
    const formData = new FormData();
    formData.append('user_input', input.userInput);

    const response = await fetch(`${FASTAPI_URL}/response`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }
    
    const result = await response.json();
    
    // The python script returns a raw string, not a JSON object.
    // So we wrap it in the expected output schema.
    return ContinueConversationOutputSchema.parse({ response: result });

  } catch (e: any) {
    console.error("Error calling FastAPI /response endpoint:", e);
    // If the server isn't running, provide a helpful message.
    if (e.cause?.code === 'ECONNREFUSED') {
       throw new Error("Could not connect to the AI chat service. Please ensure the Python server is running.");
    }
    throw new Error(`Failed to continue conversation: ${e.message}`);
  }
}
