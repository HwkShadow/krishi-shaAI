'use server';

/**
 * @fileOverview Plant disease diagnosis flow.
 *
 * - diagnosePlantDisease - A function that handles the plant disease diagnosis process.
 * - DiagnosePlantDiseaseInput - The input type for the diagnosePlantDisease function.
 * - DiagnosePlantDiseaseOutput - The return type for the diagnosePlantDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a diseased plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  symptoms: z
    .string()
    .optional()
    .describe('A text description of the plant\'s symptoms.'),
});
export type DiagnosePlantDiseaseInput = z.infer<typeof DiagnosePlantDiseaseInputSchema>;

const DiagnosisDetailSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the plant disease.'),
  treatment: z.string().describe('Suggested treatment options, including specific chemical and organic solutions, and application instructions.'),
});

const DiagnosePlantDiseaseOutputSchema = z.object({
  en: DiagnosisDetailSchema,
  hi: DiagnosisDetailSchema,
  ml: DiagnosisDetailSchema,
  confidenceScore: z.number().describe('A confidence score for the diagnosis, from 0 to 1.'),
});
export type DiagnosePlantDiseaseOutput = z.infer<typeof DiagnosePlantDiseaseOutputSchema>;

export async function diagnosePlantDisease(input: DiagnosePlantDiseaseInput): Promise<DiagnosePlantDiseaseOutput> {
  return diagnosePlantDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantDiseasePrompt',
  input: {schema: DiagnosePlantDiseaseInputSchema},
  output: {schema: DiagnosePlantDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology. A farmer needs help diagnosing a plant. 
  
  Analyze the provided information and provide a diagnosis and detailed treatment suggestions. The treatment should include both chemical and organic options with clear instructions.
  
  Provide the output in three languages: English (en), Hindi (hi), and Malayalam (ml).
  Also provide a confidence score for the diagnosis between 0 and 1.
  
  The farmer has provided the following:
  {{#if photoDataUri}}
  - Photo: {{media url=photoDataUri}}
  {{/if}}
  {{#if symptoms}}
  - Symptoms: {{{symptoms}}}
  {{/if}}
  `,
});

const diagnosePlantDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnosePlantDiseaseFlow',
    inputSchema: DiagnosePlantDiseaseInputSchema,
    outputSchema: DiagnosePlantDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
