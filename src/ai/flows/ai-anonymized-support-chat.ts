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
import {z} from 'genkit';

const AiAnonymizedSupportChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history.'),
  emotionalState: z.string().optional().describe('The user\'s emotional state.'),
});
export type AiAnonymizedSupportChatInput = z.infer<typeof AiAnonymizedSupportChatInputSchema>;

const AiAnonymizedSupportChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type AiAnonymizedSupportChatOutput = z.infer<typeof AiAnonymizedSupportChatOutputSchema>;

export async function aiAnonymizedSupportChat(input: AiAnonymizedSupportChatInput): Promise<AiAnonymizedSupportChatOutput> {
  return aiAnonymizedSupportChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAnonymizedSupportChatPrompt',
  input: {
    schema: AiAnonymizedSupportChatInputSchema,
  },
  output: {
    schema: AiAnonymizedSupportChatOutputSchema,
  },
  prompt: `You are an AI-powered support chat assistant designed to provide immediate emotional support to young people. You understand natural language, remember past interactions, and adapt your responses to the user\'s emotional state. You maintain the user's anonymity and create a safe, judgment-free space.

  Here are some guidelines:
  - Always be supportive and encouraging.
  - Acknowledge the user's feelings.
  - Offer helpful guidance and resources.
  - If the user is in crisis, provide crisis hotline information.
  - Maintain a non-clinical, humanized approach.

  Here's the user's message: {{{message}}}

  {% if chatHistory %}
  Here's the chat history:
  {{#each chatHistory}}
  {{#if (eq role \"user\")}}
  User: {{{content}}}
  {{else}}
  Assistant: {{{content}}}
  {{/if}}
  {{/each}}
  {% endif %}

  {% if emotionalState %}
  The user's emotional state is: {{{emotionalState}}}
  {% endif %}

  Respond to the user:
  `,
});

const aiAnonymizedSupportChatFlow = ai.defineFlow(
  {
    name: 'aiAnonymizedSupportChatFlow',
    inputSchema: AiAnonymizedSupportChatInputSchema,
    outputSchema: AiAnonymizedSupportChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
