import { NextResponse } from 'next/server';
import { getCoordinates } from '../../../lib/geocodingService';
import { getCurrentWeather, getForecast } from '../../../lib/brightSkyService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City query parameter is required' }, { status: 400 });
  }

  try {
    const { lat, lon, name } = await getCoordinates(city);
    
    const [currentWeather, forecast] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon)
    ]);

    return NextResponse.json({
      location: { name, lat, lon },
      currentWeather: currentWeather.weather,
      forecast: forecast.weather,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred while fetching weather data' }, { status: 500 });
  }
}
