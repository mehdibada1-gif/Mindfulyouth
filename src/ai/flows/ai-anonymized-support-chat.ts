
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
import {Message} from 'genkit';
import {z} from 'genkit';

const AiAnonymizedSupportChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'system', 'tool']),
        content: z.array(z.object({text: z.string()})),
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
- Always be supportive and encouraging.
- Acknowledge the user's feelings.
- Offer helpful guidance and resources.
- If the user is in crisis, provide crisis hotline information.
- Maintain a non-clinical, humanized approach.

{{#if emotionalState}}
The user's emotional state is: {{{emotionalState}}}
{{/if}}
`;

const aiAnonymizedSupportChatFlow = ai.defineFlow(
  {
    name: 'aiAnonymizedSupportChatFlow',
    inputSchema: AiAnonymizedSupportChatInputSchema,
    outputSchema: AiAnonymizedSupportChatOutputSchema,
  },
  async input => {
    const {message, chatHistory, emotionalState} = input;
    
    // Add the new user message to the history
    const history: Message[] = chatHistory || [];
    history.push({role: 'user', content: [{text: message}]});

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPromptTemplate,
      history: history,
      config: {
        // Pass emotionalState to the system prompt template if it exists
        ...(emotionalState ? {template_input: {emotionalState}} : {}),
      },
    });

    return {response: llmResponse.text};
  }
);
