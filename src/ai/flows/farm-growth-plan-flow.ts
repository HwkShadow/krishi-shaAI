'use server';

/**
 * @fileOverview Analyzes a farmer's complete activity log to provide a strategic growth plan.
 *
 * - getFarmGrowthPlan - A function that returns a prioritized list of recommendations.
 * - FarmGrowthPlanInput - The input type for the getFarmGrowthPlan function.
 * - FarmGrowthPlanOutput - The return type for the getFarmGrowthPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogEntrySchema = z.object({
  id: z.string(),
  activity: z.string(),
  crop: z.string(),
  date: z.string(),
  notes: z.string().optional(),
});

const FarmGrowthPlanInputSchema = z.object({
  logs: z.array(LogEntrySchema).describe("The farmer's complete activity log history."),
});
export type FarmGrowthPlanInput = z.infer<typeof FarmGrowthPlanInputSchema>;

const RecommendationSchema = z.object({
    recommendation: z.string().describe("A specific, actionable recommendation for the farmer."),
    priority: z.enum(['High', 'Medium', 'Low']).describe("The priority of this recommendation."),
    reasoning: z.string().describe("The reasoning behind why this recommendation is important based on the log history."),
});

const FarmGrowthPlanOutputSchema = z.object({
  plan: z.array(RecommendationSchema).describe('A list of prioritized recommendations for farm growth.'),
});
export type FarmGrowthPlanOutput = z.infer<typeof FarmGrowthPlanOutputSchema>;

export async function getFarmGrowthPlan(input: FarmGrowthPlanInput): Promise<FarmGrowthPlanOutput> {
  return farmGrowthPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmGrowthPlanPrompt',
  input: {schema: FarmGrowthPlanInputSchema},
  output: {schema: FarmGrowthPlanOutputSchema},
  prompt: `You are a master agronomist. A farmer has provided you with their entire log of farm activities. Analyze the logs to identify patterns, potential issues, and opportunities for improvement.

Based on your analysis, provide a prioritized list of 3-5 actionable recommendations to help the farmer improve their crop yield and farm health. For each recommendation, provide a clear priority and a brief reasoning that connects it to the data in their logs.

Here is the farmer's activity log:
{{#each logs}}
- Date: {{date}}, Crop: {{crop}}, Activity: {{activity}}{{#if notes}}, Notes: {{notes}}{{/if}}
{{/each}}

Generate a strategic growth plan. Focus on the most impactful advice.`,
});

const farmGrowthPlanFlow = ai.defineFlow(
  {
    name: 'farmGrowthPlanFlow',
    inputSchema: FarmGrowthPlanInputSchema,
    outputSchema: FarmGrowthPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
