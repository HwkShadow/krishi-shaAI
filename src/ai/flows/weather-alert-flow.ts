'use server';

/**
 * @fileOverview This flow generates weather-based alerts and advice for farmers.
 *
 * - getWeatherAlerts - A function that returns a list of alerts based on weather data.
 * - GetWeatherAlertsInput - The input type for the getWeatherAlerts function.
 * - GetWeatherAlertsOutput - The return type for the getWeatherAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './get-weather-flow';

const GetWeatherAlertsInputSchema = z.object({
  location: z.string().describe('The location to fetch weather for (e.g., city, state).'),
});
export type GetWeatherAlertsInput = z.infer<typeof GetWeatherAlertsInputSchema>;

const WeatherAlertSchema = z.object({
    title: z.string().describe("A short, catchy title for the alert."),
    description: z.string().describe("A detailed, actionable description of the alert and what the farmer should do."),
    severity: z.enum(['low', 'medium', 'high']).describe("The severity level of the alert."),
    type: z.enum(['weather', 'heat', 'wind', 'pest', 'other']).describe("The category of the alert."),
});
export type WeatherAlert = z.infer<typeof WeatherAlertSchema>;

const GetWeatherAlertsOutputSchema = z.object({
  alerts: z.array(WeatherAlertSchema).describe("A list of weather-related alerts for the farmer."),
});
export type GetWeatherAlertsOutput = z.infer<typeof GetWeatherAlertsOutputSchema>;


export async function getWeatherAlerts(input: GetWeatherAlertsInput): Promise<GetWeatherAlertsOutput> {
  return weatherAlertFlow(input);
}

// Define the schema for the weather data output, which will be used in the prompt context
const GetWeatherOutputSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    condition: z.string().describe('The current weather condition (e.g., Sunny, Cloudy).'),
    wind: z.number().describe('The wind speed in km/h.'),
    humidity: z.number().describe('The humidity percentage.'),
});

// Define a type for the context passed to the prompt
const WeatherAlertPromptContext = GetWeatherOutputSchema.extend({
    location: z.string(),
});


const prompt = ai.definePrompt({
  name: 'weatherAlertPrompt',
  input: { schema: WeatherAlertPromptContext },
  output: { schema: GetWeatherAlertsOutputSchema },
  prompt: `You are an agricultural advisor. Based on the following weather data for {{{location}}}, generate a list of 2-3 actionable alerts and recommendations for a farmer. 

  Focus on potential risks and opportunities. For example, if it's very hot, advise on irrigation. If it's very windy, advise on protecting young plants. If conditions are favorable, suggest that. Be concise and practical.

  Current Weather:
  - Temperature: {{{temperature}}}°C
  - Condition: {{{condition}}}
  - Wind Speed: {{{wind}}} km/h
  - Humidity: {{{humidity}}}%

  Generate a list of alerts based on this data. If the weather is mild and there are no immediate concerns, you can return an empty list of alerts.`,
});

const weatherAlertFlow = ai.defineFlow(
  {
    name: 'weatherAlertFlow',
    inputSchema: GetWeatherAlertsInputSchema,
    outputSchema: GetWeatherAlertsOutputSchema,
  },
  async (input) => {
    // 1. Get the weather data
    const weatherData = await getWeather({ location: input.location });

    // If there's no weather data, return no alerts
    if (!weatherData) {
      return { alerts: [] };
    }
    
    // 2. Combine weather data with location for the prompt context
    const promptContext = {
      ...weatherData,
      location: input.location,
    };

    // 3. Call the AI to generate alerts from the weather data
    const { output } = await prompt(promptContext);
    
    return output || { alerts: [] };
  }
);
