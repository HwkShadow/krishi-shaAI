'use server';

/**
 * @fileOverview Fetches localized agricultural news.
 *
 * - getLocalNews - A function that returns a list of news articles.
 * - GetLocalNewsInput - The input type for the getLocalNews function.
 * - GetLocalNewsOutput - The return type for the getLocalNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocalNewsInputSchema = z.object({
  location: z.string().describe('The location to fetch news for (e.g., city, state).'),
});
export type GetLocalNewsInput = z.infer<typeof GetLocalNewsInputSchema>;

const NewsArticleSchema = z.object({
    title: z.string().describe("The headline of the news article."),
    summary: z.string().describe("A brief summary of the news article."),
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
  
  For each article, provide a realistic title, a concise summary, a plausible source (like a real Indian newspaper or agricultural board), a fictional but valid URL, and a recent publication date within the last week.`,
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
