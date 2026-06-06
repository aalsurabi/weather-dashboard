import { NextResponse } from 'next/server';
import { getCoordinates } from '../../../lib/geocodingService';
import { getCurrentWeather, getForecast, getAlerts } from '../../../lib/brightSkyService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City query parameter is required' }, { status: 400 });
  }

  try {
    const { lat, lon, name } = await getCoordinates(city);
    
    const [currentWeather, forecast, alertsData] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon),
      getAlerts(lat, lon).catch(err => {
        console.error('Failed to fetch DWD alerts:', err);
        return { alerts: [] };
      })
    ]);

    return NextResponse.json({
      location: { name, lat, lon },
      currentWeather: currentWeather.weather,
      forecast: forecast.weather,
      alerts: alertsData?.alerts || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred while fetching weather data' }, { status: 500 });
  }
}

