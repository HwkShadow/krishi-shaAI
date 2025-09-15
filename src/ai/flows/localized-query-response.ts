'use server';

/**
 * @fileOverview This flow handles localized queries from farmers, providing answers tailored to their region's agricultural conditions.
 *
 * - localizedQueryResponse - A function that processes the farmer's query and returns a localized response.
 * - LocalizedQueryResponseInput - The input type for the localizedQueryResponse function.
 * - LocalizedQueryResponseOutput - The return type for the localizedQueryResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocalizedQueryResponseInputSchema = z.object({
  query: z.string().describe('The farmer\'s query in any language.'),
  location: z.string().describe('The location of the farmer (e.g., city, state).'),
});
export type LocalizedQueryResponseInput = z.infer<typeof LocalizedQueryResponseInputSchema>;

const LocalizedQueryResponseOutputSchema = z.object({
  response: z.string().describe('The localized response to the farmer\'s query.'),
});
export type LocalizedQueryResponseOutput = z.infer<typeof LocalizedQueryResponseOutputSchema>;

export async function localizedQueryResponse(input: LocalizedQueryResponseInput): Promise<LocalizedQueryResponseOutput> {
  return localizedQueryResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'localizedQueryResponsePrompt',
  input: {schema: LocalizedQueryResponseInputSchema},
  output: {schema: LocalizedQueryResponseOutputSchema},
  prompt: `You are an agricultural expert providing advice to farmers in their local region.

  The farmer is located in: {{{location}}}
  Their query is: {{{query}}}

  Provide a response that is relevant to their location and agricultural conditions.
  Take into account the local climate, common crops, and any specific challenges faced by farmers in that region.
`,
});

const localizedQueryResponseFlow = ai.defineFlow(
  {
    name: 'localizedQueryResponseFlow',
    inputSchema: LocalizedQueryResponseInputSchema,
    outputSchema: LocalizedQueryResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
