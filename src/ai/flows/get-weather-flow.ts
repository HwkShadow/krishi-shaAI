'use server';

/**
 * @fileOverview This flow fetches weather data for a given location.
 *
 * - getWeather - A function that returns weather data for a location.
 * - GetWeatherInput - The input type for the getWeather function.
 * - GetWeatherOutput - The return type for the getWeather function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeatherInputSchema = z.object({
  location: z.string().describe('The location to fetch weather for (e.g., city, state).'),
});
export type GetWeatherInput = z.infer<typeof GetWeatherInputSchema>;

const GetWeatherOutputSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    condition: z.string().describe('The current weather condition (e.g., Sunny, Cloudy).'),
    wind: z.number().describe('The wind speed in km/h.'),
    humidity: z.number().describe('The humidity percentage.'),
});
export type GetWeatherOutput = z.infer<typeof GetWeatherOutputSchema>;

export async function getWeather(input: GetWeatherInput): Promise<GetWeatherOutput> {
  return getWeatherFlow(input);
}

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: GetWeatherInputSchema,
    outputSchema: GetWeatherOutputSchema,
  },
  async (input) => {
    // In a real app, you would call a weather API here.
    // For this example, we'll return mock data that's slightly more realistic.
    const mockWeatherData: Record<string, Omit<GetWeatherOutput, 'condition'>> = {
        "punjab, india": { temperature: 35, wind: 12, humidity: 40 },
        "kerala, india": { temperature: 28, wind: 20, humidity: 85 },
        "mumbai, india": { temperature: 31, wind: 18, humidity: 78 },
        "default": { temperature: 32, wind: 15, humidity: 45 }
    };
    
    const locationKey = input.location.toLowerCase();
    const baseWeather = mockWeatherData[locationKey] || mockWeatherData["default"];

    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour >= 18;

    let condition = "Sunny";
    if (locationKey.includes("kerala")) {
      condition = isNight ? "Cloudy Night" : "Cloudy with chance of rain";
    } else if (locationKey.includes("mumbai")) {
      condition = isNight ? "Partly Cloudy" : "Humid and Overcast";
    } else {
      condition = isNight ? "Clear Night" : "Sunny";
    }
    
    const finalWeather: GetWeatherOutput = {
      ...baseWeather,
      condition,
      temperature: isNight ? baseWeather.temperature - 5 : baseWeather.temperature,
    };
    
    return finalWeather;
  }
);
