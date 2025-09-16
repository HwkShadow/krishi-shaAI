'use server';

/**
 * @fileOverview Translates text into English, Hindi, and Malayalam.
 *
 * - translateText - A function that returns translations.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  originalLanguage: z.string().describe('The detected original language of the text (e.g., "English", "Hindi").'),
  en: z.string().describe('The English translation.'),
  hi: z.string().describe('The Hindi translation.'),
  ml: z.string().describe('The Malayalam translation.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a translation expert. First, detect the language of the following text. Then, translate it into English (en), Hindi (hi), and Malayalam (ml).

  Return the detected original language and all three translations.

  Text to translate:
  {{{text}}}
  `,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
