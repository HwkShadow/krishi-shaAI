'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/plant-disease-diagnosis.ts';
import '@/ai/flows/localized-query-response.ts';
import '@/ai/flows/get-weather-flow.ts';
import '@/ai/flows/farm-log-suggestion-flow.ts';
import '@/ai/flows/speech-to-text-flow.ts';
import '@/ai/flows/weather-alert-flow.ts';
