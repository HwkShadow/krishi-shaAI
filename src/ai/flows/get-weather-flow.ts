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
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured.');
    }
    
    // 1. Geocode location to get coordinates
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input.location)}&limit=1&appid=${apiKey}`;
    
    let lat: number, lon: number;

    try {
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) {
        throw new Error(`Failed to geocode location: ${geoResponse.statusText}`);
      }
      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        throw new Error(`Could not find coordinates for location: ${input.location}`);
      }
      lat = geoData[0].lat;
      lon = geoData[0].lon;
    } catch (e: any) {
        console.error('Geocoding API error:', e.message);
        throw new Error('Failed to retrieve location coordinates. Please check the location name.');
    }

    // 2. Fetch weather using coordinates
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
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
        throw new Error('Failed to retrieve weather data.');
    }
  }
);
