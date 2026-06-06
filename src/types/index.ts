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

export const BrightSkyAlertSchema = z.object({
  id: z.number().nullish(),
  alert_id: z.string().nullish(),
  onset: z.string().nullish(),
  expires: z.string().nullish(),
  severity: z.enum(['minor', 'moderate', 'severe', 'extreme']).nullish(),
  event_de: z.string().nullish(),
  event_en: z.string().nullish(),
  headline_de: z.string().nullish(),
  headline_en: z.string().nullish(),
  description_de: z.string().nullish(),
  description_en: z.string().nullish(),
  instruction_de: z.string().nullish(),
  instruction_en: z.string().nullish(),
});

export const BrightSkyAlertsSchema = z.object({
  alerts: z.array(BrightSkyAlertSchema),
});

export type BrightSkyCurrentWeather = z.infer<typeof BrightSkyCurrentWeatherSchema>;
export type BrightSkyForecast = z.infer<typeof BrightSkyForecastSchema>;
export type BrightSkyAlerts = z.infer<typeof BrightSkyAlertsSchema>;
export type BrightSkyAlert = z.infer<typeof BrightSkyAlertSchema>;

export interface GeocodingResult {
  lat: number;
  lon: number;
  name: string;
}

