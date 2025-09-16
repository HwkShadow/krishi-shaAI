'use server';

/**
 * @fileOverview Fetches localized agricultural news in multiple languages.
 *
 * - getLocalNews - A function that returns a list of news articles.
 * - GetLocalNewsInput - The input type for the getLocalNews function.
 * - GetLocalNewsOutput - The return type for the getLocalNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocalNewsInputSchema = z.object({
  location: z.string().describe('The location to fetch news for (e.g., city, state).'),
  language: z.enum(['en', 'hi', 'ml']).optional().describe('The preferred language for the news articles.'),
});
export type GetLocalNewsInput = z.infer<typeof GetLocalNewsInputSchema>;

const TranslatedContentSchema = z.object({
    en: z.string().describe('The English version of the content.'),
    hi: z.string().describe('The Hindi version of the content.'),
    ml: z.string().describe('The Malayalam version of the content.'),
});

const NewsArticleSchema = z.object({
    title: TranslatedContentSchema.describe("The headline of the news article in English, Hindi, and Malayalam."),
    summary: TranslatedContentSchema.describe("A brief summary of the news article in English, Hindi, and Malayalam."),
    source: z.string().describe("The source of the news (e.g., a publication name)."),
    url: z.string().url().describe("The URL to the full article."),
    publishedAt: z.string().describe("The publication date in ISO 8601 format."),
});

const GetLocalNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema).describe("A list of relevant news articles."),
});
export type GetLocalNewsOutput = z.infer<typeof GetLocalNewsOutputSchema>;


export async function getLocalNews(input: GetLocalNewsInput): Promise<GetLocalNewsOutput> {
  return getLocalNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLocalNewsPrompt',
  input: { schema: GetLocalNewsInputSchema },
  output: { schema: GetLocalNewsOutputSchema },
  prompt: `You are an agricultural news aggregator. Generate a list of 3 recent, realistic, and relevant news articles for farmers in the following location: {{{location}}}.

  Focus on topics like new government schemes, crop price updates, weather advisories, new farming techniques, or pest alerts relevant to the region.
  
  For each article, provide a realistic title, a concise summary, a plausible source (like a real Indian newspaper or agricultural board), a fictional but valid URL, and a recent publication date within the last week.
  
  IMPORTANT: Generate the 'title' and 'summary' for each article in all three languages: English (en), Hindi (hi), and Malayalam (ml).
  The user's preferred language is {{language}}, but you must provide all three translations.`,
});

const getLocalNewsFlow = ai.defineFlow(
  {
    name: 'getLocalNewsFlow',
    inputSchema: GetLocalNewsInputSchema,
    outputSchema: GetLocalNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || { articles: [] };
  }
);
