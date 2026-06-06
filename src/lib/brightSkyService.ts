import { 
  BrightSkyCurrentWeatherSchema, 
  BrightSkyForecastSchema,
  BrightSkyAlertsSchema,
  BrightSkyCurrentWeather,
  BrightSkyForecast,
  BrightSkyAlerts
} from '../types';

export async function getCurrentWeather(lat: number, lon: number): Promise<BrightSkyCurrentWeather> {
  const url = `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch current weather: ${response.statusText}`);
  }
  
  const data = await response.json();
  return BrightSkyCurrentWeatherSchema.parse(data);
}

export async function getForecast(lat: number, lon: number): Promise<BrightSkyForecast> {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url = `https://api.brightsky.dev/weather?lat=${lat}&lon=${lon}&date=${today}&last_date=${nextWeek}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch forecast: ${response.statusText}`);
  }
  
  const data = await response.json();
  return BrightSkyForecastSchema.parse(data);
}

export async function getAlerts(lat: number, lon: number): Promise<BrightSkyAlerts> {
  const url = `https://api.brightsky.dev/alerts?lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  
  const data = await response.json();
  return BrightSkyAlertsSchema.parse(data);
}

