import { NextResponse } from 'next/server';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    amenity?: string;
    leisure?: string;
    historic?: string;
    tourism?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface RecommendedPOI {
  id: number;
  type: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, string>;
}

// Map weather icon name to friendly German weather description phrase
const weatherDescriptionMap: Record<string, string> = {
  'clear-day': 'sonnigen Wetter',
  'clear-night': 'klaren Nachthimmel',
  'partly-cloudy-day': 'leicht bewölkten Wetter',
  'partly-cloudy-night': 'leicht bewölkten Nachthimmel',
  'cloudy': 'bewölkten Wetter',
  'rain': 'regnerischen Wetter',
  'snow': 'schneebedeckten Wetter',
  'sleet': 'Schneeregen',
  'hail': 'Hagelwetter',
  'thunderstorm': 'Gewitterwetter',
  'fog': 'nebligen Wetter',
  'wind': 'windigen Wetter',
};

// Helper: Fisher-Yates shuffle algorithm to randomize selection
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Maps weather conditions to indoor vs outdoor flag
function isBadWeatherIcon(icon: string | null | undefined): boolean {
  if (!icon) return false;
  const badIcons = ['rain', 'snow', 'sleet', 'hail', 'thunderstorm', 'fog'];
  return badIcons.includes(icon);
}

// Helper: Construct Overpass QL Query
function buildOverpassQuery(
  city: string, 
  lat: number, 
  lon: number, 
  isBadWeather: boolean, 
  useCoordsFallback = false
): string {
  const indoorTags = `
    node["amenity"="museum"](area.searchArea);
    way["amenity"="museum"](area.searchArea);
    node["amenity"="cinema"](area.searchArea);
    way["amenity"="cinema"](area.searchArea);
    node["amenity"="library"](area.searchArea);
    way["amenity"="library"](area.searchArea);
    node["amenity"="theatre"](area.searchArea);
    way["amenity"="theatre"](area.searchArea);
    node["amenity"="cafe"](area.searchArea);
    way["amenity"="cafe"](area.searchArea);
  `;

  const outdoorTags = `
    node["leisure"="park"](area.searchArea);
    way["leisure"="park"](area.searchArea);
    node["leisure"="garden"](area.searchArea);
    way["leisure"="garden"](area.searchArea);
    node["historic"="castle"](area.searchArea);
    way["historic"="castle"](area.searchArea);
    node["tourism"="zoo"](area.searchArea);
    way["tourism"="zoo"](area.searchArea);
    node["tourism"="viewpoint"](area.searchArea);
    way["tourism"="viewpoint"](area.searchArea);
  `;

  if (useCoordsFallback) {
    const indoorTagsCoords = `
      node["amenity"="museum"](around:10000, ${lat}, ${lon});
      way["amenity"="museum"](around:10000, ${lat}, ${lon});
      node["amenity"="cinema"](around:10000, ${lat}, ${lon});
      way["amenity"="cinema"](around:10000, ${lat}, ${lon});
      node["amenity"="library"](around:10000, ${lat}, ${lon});
      way["amenity"="library"](around:10000, ${lat}, ${lon});
      node["amenity"="theatre"](around:10000, ${lat}, ${lon});
      way["amenity"="theatre"](around:10000, ${lat}, ${lon});
      node["amenity"="cafe"](around:10000, ${lat}, ${lon});
      way["amenity"="cafe"](around:10000, ${lat}, ${lon});
    `;
    const outdoorTagsCoords = `
      node["leisure"="park"](around:10000, ${lat}, ${lon});
      way["leisure"="park"](around:10000, ${lat}, ${lon});
      node["leisure"="garden"](around:10000, ${lat}, ${lon});
      way["leisure"="garden"](around:10000, ${lat}, ${lon});
      node["historic"="castle"](around:10000, ${lat}, ${lon});
      way["historic"="castle"](around:10000, ${lat}, ${lon});
      node["tourism"="zoo"](around:10000, ${lat}, ${lon});
      way["tourism"="zoo"](around:10000, ${lat}, ${lon});
      node["tourism"="viewpoint"](around:10000, ${lat}, ${lon});
      way["tourism"="viewpoint"](around:10000, ${lat}, ${lon});
    `;
    return `[out:json][timeout:15];
(
  ${isBadWeather ? indoorTagsCoords : outdoorTagsCoords}
);
out center 40;`;
  }

  return `[out:json][timeout:15];
area["name"="${city}"]->.searchArea;
(
  ${isBadWeather ? indoorTags : outdoorTags}
);
out center 40;`;
}

// Helper: Perform Overpass Fetch (using GET to leverage Next.js fetch cache)
async function fetchOverpassData(query: string): Promise<OverpassResponse> {
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  const response = await fetch(overpassUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'WeatherDashboardApp/1.0 (contact: admin@weatherdashboard.de)',
    },
    next: { revalidate: 10800 } // Cache results for 3 hours (10800 seconds)
  });

  if (!response.ok) {
    throw new Error(`Overpass API responded with status ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json(
      { error: 'City query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // 1. Geocode the city using Open-Meteo Geocoding API (Fast, Free, Cacheable)
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=de`;
    const geocodingRes = await fetch(geocodingUrl, {
      next: { revalidate: 10800 } // Cache coordinates for 3 hours
    });

    if (!geocodingRes.ok) {
      throw new Error(`Geocoding service failed: ${geocodingRes.statusText}`);
    }

    const geocodingData = await geocodingRes.json();
    if (!geocodingData.results || geocodingData.results.length === 0) {
      return NextResponse.json(
        { error: `Stadt "${city}" konnte nicht gefunden werden.` },
        { status: 404 }
      );
    }

    const { latitude: lat, longitude: lon, name: resolvedCity } = geocodingData.results[0];

    // 2. Fetch current weather from Bright Sky (DWD source)
    const brightSkyUrl = `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`;
    const weatherRes = await fetch(brightSkyUrl, {
      next: { revalidate: 10800 } // Cache weather state for 3 hours
    });

    if (!weatherRes.ok) {
      throw new Error(`Bright Sky weather fetch failed: ${weatherRes.statusText}`);
    }

    const weatherData = await weatherRes.json();
    const weatherRecord = weatherData?.weather || {};
    const icon = weatherRecord.icon || 'clear-day';
    const temp = weatherRecord.temperature ?? null;

    // 3. Map condition to weather classification
    const isBadWeather = isBadWeatherIcon(icon);
    const weatherCategory = isBadWeather ? 'bad_weather' : 'good_weather';
    const weatherDescriptionText = weatherDescriptionMap[icon] || 'aktuellen Wetter';

    // 4. Spatial POI Fetch (Overpass API)
    let query = buildOverpassQuery(resolvedCity, lat, lon, isBadWeather, false);
    let overpassData: OverpassResponse;

    try {
      overpassData = await fetchOverpassData(query);
    } catch (e) {
      console.warn(`Overpass boundary query failed for "${resolvedCity}", falling back to coordinate query.`, e);
      // Fallback: If area query fails or times out, query using around:10000 on lat/lon
      query = buildOverpassQuery(resolvedCity, lat, lon, isBadWeather, true);
      overpassData = await fetchOverpassData(query);
    }

    // Fallback if boundary query succeeded but returned 0 elements
    if (!overpassData.elements || overpassData.elements.length === 0) {
      query = buildOverpassQuery(resolvedCity, lat, lon, isBadWeather, true);
      overpassData = await fetchOverpassData(query);
    }

    const elements = overpassData.elements || [];

    // Parse and sanitize POIs (Must have a name)
    const pois: RecommendedPOI[] = elements
      .filter((el): el is OverpassElement & { tags: { name: string } } => {
        return !!el.tags && typeof el.tags.name === 'string' && el.tags.name.trim() !== '';
      })
      .map(el => {
        let category = 'Aktivität';
        if (el.tags.amenity) {
          if (el.tags.amenity === 'museum') category = 'Museum';
          else if (el.tags.amenity === 'cinema') category = 'Kino';
          else if (el.tags.amenity === 'library') category = 'Bibliothek';
          else if (el.tags.amenity === 'theatre') category = 'Theater';
          else if (el.tags.amenity === 'cafe') category = 'Café';
        } else if (el.tags.leisure) {
          if (el.tags.leisure === 'park') category = 'Park';
          else if (el.tags.leisure === 'garden') category = 'Garten';
        } else if (el.tags.historic) {
          if (el.tags.historic === 'castle') category = 'Burg / Schloss';
        } else if (el.tags.tourism) {
          if (el.tags.tourism === 'zoo') category = 'Zoo';
          else if (el.tags.tourism === 'viewpoint') category = 'Aussichtspunkt';
        }

        return {
          id: el.id,
          type: el.type,
          name: el.tags.name,
          lat: el.lat || el.center?.lat || lat,
          lon: el.lon || el.center?.lon || lon,
          category,
          tags: el.tags as Record<string, string>
        };
      });

    // 5. Randomize results and slice to exactly 6 recommendations
    const shuffled = shuffleArray(pois);
    const recommendations = shuffled.slice(0, 6);

    // 6. Hard fallback if there are less than 6 POIs (e.g. smaller towns with incomplete OSM tags)
    if (recommendations.length < 6) {
      const genericFallbacks: RecommendedPOI[] = isBadWeather
        ? [
            { id: 100001, type: 'node', name: 'Lokales Heimatmuseum', lat, lon, category: 'Museum', tags: { amenity: 'museum' } },
            { id: 100002, type: 'node', name: 'Stadtbibliothek', lat, lon, category: 'Bibliothek', tags: { amenity: 'library' } },
            { id: 100003, type: 'node', name: 'Lokales Programmkino', lat, lon, category: 'Kino', tags: { amenity: 'cinema' } },
            { id: 100004, type: 'node', name: 'Stadttheater', lat, lon, category: 'Theater', tags: { amenity: 'theatre' } },
            { id: 100005, type: 'node', name: 'Gemütliches Café', lat, lon, category: 'Café', tags: { amenity: 'cafe' } },
            { id: 100006, type: 'node', name: 'Kunstgalerie', lat, lon, category: 'Museum', tags: { amenity: 'museum' } }
          ]
        : [
            { id: 200001, type: 'node', name: 'Stadtpark & Grünanlage', lat, lon, category: 'Park', tags: { leisure: 'park' } },
            { id: 200002, type: 'node', name: 'Botanischer Garten', lat, lon, category: 'Garten', tags: { leisure: 'garden' } },
            { id: 200003, type: 'node', name: 'Schlossruine & Park', lat, lon, category: 'Burg / Schloss', tags: { historic: 'castle' } },
            { id: 200004, type: 'node', name: 'Lokaler Tierpark', lat, lon, category: 'Zoo', tags: { tourism: 'zoo' } },
            { id: 200005, type: 'node', name: 'Panoramablick Aussichtspunkt', lat, lon, category: 'Aussichtspunkt', tags: { tourism: 'viewpoint' } },
            { id: 200006, type: 'node', name: 'Café mit Terrasse', lat, lon, category: 'Café', tags: { amenity: 'cafe' } }
          ];

      while (recommendations.length < 6 && genericFallbacks.length > 0) {
        const fallback = genericFallbacks.shift()!;
        if (!recommendations.some(r => r.name.toLowerCase() === fallback.name.toLowerCase())) {
          recommendations.push(fallback);
        }
      }
    }

    // 7. Success response payload
    return NextResponse.json({
      city: resolvedCity,
      coordinates: { lat, lon },
      weather: {
        temperature: temp,
        icon,
        category: weatherCategory,
        descriptionText: `passen perfekt zum ${weatherDescriptionText}`
      },
      recommendations
    });

  } catch (error: any) {
    console.error('Error in recommend-activity route:', error);
    return NextResponse.json(
      { error: error.message || 'Ein interner Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
