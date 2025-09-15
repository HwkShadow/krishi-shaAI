'use server';

/**
 * @fileOverview Provides suggestions for the next farming steps based on the last activity.
 *
 * - getFarmLogSuggestion - A function that returns a suggestion for the next farming step.
 * - FarmLogSuggestionInput - The input type for the getFarmLogSuggestion function.
 * - FarmLogSuggestionOutput - The return type for the getFarmLogSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmLogSuggestionInputSchema = z.object({
  activity: z.string().describe('The last activity performed by the farmer.'),
  crop: z.string().describe('The crop on which the activity was performed.'),
  date: z.string().describe('The date of the last activity in ISO format.'),
  notes: z.string().optional().describe('Any notes from the farmer about the activity.'),
});
export type FarmLogSuggestionInput = z.infer<typeof FarmLogSuggestionInputSchema>;

const FarmLogSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('A concise and actionable suggestion for the next farming step.'),
});
export type FarmLogSuggestionOutput = z.infer<typeof FarmLogSuggestionOutputSchema>;

export async function getFarmLogSuggestion(input: FarmLogSuggestionInput): Promise<FarmLogSuggestionOutput> {
  return farmLogSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmLogSuggestionPrompt',
  input: {schema: FarmLogSuggestionInputSchema},
  output: {schema: FarmLogSuggestionOutputSchema},
  prompt: `You are an agricultural expert providing advice to farmers. Based on the last activity logged by a farmer, provide a single, actionable suggestion for the next logical step they should consider for their crop. Keep the suggestion brief and to the point.

  Context:
  - Crop: {{{crop}}}
  - Last Activity: {{{activity}}}
  - Date of Activity: {{{date}}}
  {{#if notes}}- Notes: {{{notes}}}{{/if}}

  Example: If the last activity was 'Sowing', a good suggestion would be 'Consider applying a pre-emergence herbicide within the next 2-3 days to control early weeds.'

  Provide your suggestion.`,
});

const farmLogSuggestionFlow = ai.defineFlow(
  {
    name: 'farmLogSuggestionFlow',
    inputSchema: FarmLogSuggestionInputSchema,
    outputSchema: FarmLogSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
