import { GeocodingResult } from '../types';

export async function getCoordinates(query: string): Promise<GeocodingResult> {
  const cleanQuery = query.trim();

  // Check if the query is coordinates (e.g., "52.5156, 13.3870" or "52.5156,13.3870")
  const coordMatch = cleanQuery.match(/^([+-]?\d+(?:\.\d+)?),\s*([+-]?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    let name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    try {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=de`;
      const reverseResponse = await fetch(reverseUrl, {
        headers: { 
          'User-Agent': 'WeatherDash/1.0',
          'Accept-Language': 'de'
        }
      });
      if (reverseResponse.ok) {
        const reverseData = await reverseResponse.json();
        if (reverseData.address) {
          const addr = reverseData.address;
          name = addr.city || addr.town || addr.village || addr.suburb || addr.borough || addr.county || addr.country || name;
        }
      }
    } catch (e) {
      console.error('Reverse geocoding failed, using coordinates:', e);
    }
    return { lat, lon, name };
  }

  // Check if the query is a 5-digit German postal code (PLZ)
  if (/^\d{5}$/.test(cleanQuery)) {
    try {
      const zipUrl = `https://api.zippopotam.us/de/${cleanQuery}`;
      const zipResponse = await fetch(zipUrl);
      if (zipResponse.ok) {
        const zipData = await zipResponse.json();
        if (zipData.places && zipData.places.length > 0) {
          const place = zipData.places[0];
          return {
            lat: parseFloat(place.latitude),
            lon: parseFloat(place.longitude),
            name: `${place['place name']} (${cleanQuery})`,
          };
        }
      }
    } catch (err) {
      console.error('Zippopotam.us API failed, falling back to Open-Meteo:', err);
    }
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=de`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch from Geocoding API');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Location not found: ${cleanQuery}`);
  }

  const result = data.results[0];
  return {
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
  };
}
