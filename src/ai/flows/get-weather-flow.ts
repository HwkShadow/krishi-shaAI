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

export const GetWeatherOutputSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    condition: z.string().describe('The current weather condition (e.g., Sunny, Cloudy).'),
    wind: z.number().describe('The wind speed in km/h.'),
    humidity: z.number().describe('The humidity percentage.'),
});
export type GetWeatherOutput = z.infer<typeof GetWeatherOutputSchema>;

export async function getWeather(input: GetWeatherInput): Promise<GetWeatherOutput | null> {
  return getWeatherFlow(input);
}

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: GetWeatherInputSchema,
    outputSchema: z.union([GetWeatherOutputSchema, z.null()]),
  },
  async (input) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn('OpenWeather API key is not configured. Weather data will not be available. Please add OPENWEATHER_API_KEY to your .env file.');
      return null;
    }
    
    // 1. Geocode location to get coordinates
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input.location)}&limit=1&appid=${apiKey}`;
    
    let lat: number, lon: number;

    try {
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) {
        console.error(`Failed to geocode location: ${geoResponse.statusText}`);
        return null;
      }
      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        console.error(`Could not find coordinates for location: ${input.location}`);
        return null;
      }
      lat = geoData[0].lat;
      lon = geoData[0].lon;
    } catch (e: any) {
        console.error('Geocoding API error:', e.message);
        return null;
    }

    // 2. Fetch weather using coordinates
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            console.error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
            return null;
        }
        const weatherData = await weatherResponse.json();
        
        // 3. Map API response to our output schema
        return {
            temperature: Math.round(weatherData.main.temp),
            condition: weatherData.weather[0]?.main || 'N/A',
            wind: Math.round(weatherData.wind.speed * 3.6), // m/s to km/h
            humidity: weatherData.main.humidity,
        };
    } catch (e: any) {
        console.error('Weather API error:', e.message);
        return null;
    }
  }
);
