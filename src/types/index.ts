import { z } from 'zod';

export const BrightSkyCurrentWeatherSchema = z.object({
  weather: z.object({
    temperature: z.number().nullish(),
    relative_humidity: z.number().nullish(),
    wind_speed: z.number().nullish(),
    wind_speed_10: z.number().nullish(),
    wind_direction: z.number().nullish(),
    icon: z.string().nullish(),
    timestamp: z.string(),
    precipitation: z.number().nullish(),
    precipitation_probability: z.number().nullish(),
    pressure_msl: z.number().nullish(),
  }),
});

export const BrightSkyForecastSchema = z.object({
  weather: z.array(
    z.object({
      temperature: z.number().nullish(),
      relative_humidity: z.number().nullish(),
      wind_speed: z.number().nullish(),
      wind_speed_10: z.number().nullish(),
      wind_direction: z.number().nullish(),
      icon: z.string().nullish(),
      timestamp: z.string(),
      precipitation: z.number().nullish(),
      precipitation_probability: z.number().nullish(),
      pressure_msl: z.number().nullish(),
    })
  ),
});

export type BrightSkyCurrentWeather = z.infer<typeof BrightSkyCurrentWeatherSchema>;
export type BrightSkyForecast = z.infer<typeof BrightSkyForecastSchema>;

export interface GeocodingResult {
  lat: number;
  lon: number;
  name: string;
}
