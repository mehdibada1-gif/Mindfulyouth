
'use server';
/**
 * @fileOverview An AI-powered support chat flow that provides immediate emotional support,
 * understands natural language, remembers past interactions, and adapts its responses
 * to the user's emotional state.  It exports:
 *
 * - `aiAnonymizedSupportChat` - A function that handles the support chat process.
 * - `AiAnonymizedSupportChatInput` - The input type for the aiAnonymizedSupportChat function.
 * - `AiAnonymizedSupportChatOutput` - The return type for the aiAnonymizedSupportChat function.
 */

import {ai} from '@/ai/genkit';
import {GenerateRequest, Message, Part} from 'genkit';
import {z} from 'genkit';

const AiAnonymizedSupportChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history.'),
  emotionalState: z
    .string()
    .optional()
    .describe("The user's emotional state."),
});
export type AiAnonymizedSupportChatInput = z.infer<
  typeof AiAnonymizedSupportChatInputSchema
>;

const AiAnonymizedSupportChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type AiAnonymizedSupportChatOutput = z.infer<
  typeof AiAnonymizedSupportChatOutputSchema
>;

export async function aiAnonymizedSupportChat(
  input: AiAnonymizedSupportChatInput
): Promise<AiAnonymizedSupportChatOutput> {
  return aiAnonymizedSupportChatFlow(input);
}

const systemPromptTemplate = `You are an AI-powered support chat assistant designed to provide immediate emotional support to young people. You understand natural language, remember past interactions, and adapt your responses to the user's emotional state. You maintain the user's anonymity and create a safe, judgment-free space.

Here are some guidelines:
- Always be supportive, empathetic, and encouraging.
- Acknowledge and validate the user's feelings.
- Provide comprehensive, open, and thoughtful responses. Avoid short, simple answers.
- Be proactive in offering insights, different perspectives, and gentle guidance.
- Ask clarifying questions only when truly necessary to understand the core issue. Your goal is to support, not to interrogate.
- If the user is in crisis, provide crisis hotline information.
- Maintain a non-clinical, humanized, and conversational approach.
`;

const aiAnonymizedSupportChatFlow = ai.defineFlow(
  {
    name: 'aiAnonymizedSupportChatFlow',
    inputSchema: AiAnonymizedSupportChatInputSchema,
    outputSchema: AiAnonymizedSupportChatOutputSchema,
  },
  async input => {
    const {message, chatHistory, emotionalState} = input;
    
    // Dynamically build the system prompt
    let finalSystemPrompt = systemPromptTemplate;
    if (emotionalState) {
        finalSystemPrompt += `
The user's current emotional state is: ${emotionalState}. Please tailor your response to be mindful of this.`;
    }

    // Construct the full conversation history for the AI model.
    // The format is a single array of alternating user and model messages.
    // This is the correct way to handle multi-turn conversations with Gemini.
    const prompt: (Part | string)[] = [{text: finalSystemPrompt}];
    
    (chatHistory || []).forEach(msg => {
      prompt.push({
        role: msg.role,
        text: msg.content
      });
    });

    // Add the user's latest message to the end of the prompt history.
    prompt.push({ role: 'user', text: message });

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: prompt,
    });

    return {response: llmResponse.text};
  }
);
