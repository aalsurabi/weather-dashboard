import { NextResponse } from 'next/server';
import { getCoordinates } from '../../../lib/geocodingService';
import { getCurrentWeather, getForecast } from '../../../lib/brightSkyService';

async function classifyQuery(message: string, apiKey: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'WeatherDash'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are a system coordinator for a weather dashboard.
Analyze the user's message and determine:
1. Is the message relevant to weather, forecasting, current weather conditions, clothing recommendations based on weather, or this weather app dashboard itself?
2. If relevant, extract the location (city, region, country, or postcode) they are asking about if any. If they do not specify a location, output null.
3. Does answering this message require loading current weather/forecast data? (e.g. "Do I need an umbrella tomorrow in Berlin?" requires it, but "What is this app?" or "Hello" does not).

You MUST respond ONLY with a valid JSON object in this format:
{
  "relevant": boolean,
  "location": string | null,
  "requiresWeather": boolean
}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter classification failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  
  let result;
  try {
    result = JSON.parse(text);
  } catch (err) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      result = JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse classification JSON: ' + text);
    }
  }
  return result;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenRouter API key is not configured' }, { status: 500 });
  }

  try {
    const { message, currentCity } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Phase 1: Classification & Intent Extraction
    const classification = await classifyQuery(message, apiKey);
    
    if (!classification.relevant) {
      return NextResponse.json({
        message: "Entschuldigung, ich kann nur Fragen beantworten, die mit dem Wetter, Vorhersagen oder dieser Anwendung zu tun haben. Bei anderen Themen kann ich dir leider nicht helfen."
      });
    }

    // Phase 2: Weather Context Assembly
    let weatherSummary = '';
    let resolvedName = currentCity || 'Berlin';

    if (classification.requiresWeather) {
      const searchCity = classification.location || currentCity || 'Berlin';
      try {
        const { lat, lon, name } = await getCoordinates(searchCity);
        resolvedName = name;

        const [currentWeather, forecast] = await Promise.all([
          getCurrentWeather(lat, lon),
          getForecast(lat, lon)
        ]);

        const dailyForecasts: Record<string, {
          temps: number[],
          humidities: number[],
          winds: number[],
          rainProbs: number[],
          conditions: string[]
        }> = {};

        if (forecast && forecast.weather) {
          forecast.weather.forEach((item: any) => {
            if (!item.timestamp) return;
            const dateKey = new Date(item.timestamp).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
            if (!dailyForecasts[dateKey]) {
              dailyForecasts[dateKey] = { temps: [], humidities: [], winds: [], rainProbs: [], conditions: [] };
            }
            if (item.temperature !== null) dailyForecasts[dateKey].temps.push(item.temperature);
            if (item.relative_humidity !== null) dailyForecasts[dateKey].humidities.push(item.relative_humidity);
            if (item.wind_speed !== null) dailyForecasts[dateKey].winds.push(item.wind_speed);
            if (item.precipitation_probability !== null) dailyForecasts[dateKey].rainProbs.push(item.precipitation_probability);
            if (item.icon) dailyForecasts[dateKey].conditions.push(item.icon);
          });
        }

        let forecastSummary = '';
        Object.entries(dailyForecasts).slice(0, 3).forEach(([day, data]) => {
          const minTemp = data.temps.length ? Math.min(...data.temps).toFixed(1) : '--';
          const maxTemp = data.temps.length ? Math.max(...data.temps).toFixed(1) : '--';
          const avgHum = data.humidities.length ? (data.humidities.reduce((a,b)=>a+b, 0)/data.humidities.length).toFixed(0) : '--';
          const maxRain = data.rainProbs.length ? Math.max(...data.rainProbs) : 0;
          
          const conditionCounts = data.conditions.reduce((acc: Record<string, number>, cond) => {
            acc[cond] = (acc[cond] || 0) + 1;
            return acc;
          }, {});
          const mainCondition = Object.entries(conditionCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'clear';

          forecastSummary += `- ${day}: Temp: ${minTemp}°C bis ${maxTemp}°C, Hauptzustand: ${mainCondition}, Regenrisiko: ${maxRain}%, Luftfeuchtigkeit: ${avgHum}%\n`;
        });

        const currentTemp = currentWeather?.weather?.temperature ?? '--';
        const currentWind = currentWeather?.weather?.wind_speed ?? '--';
        const currentHum = currentWeather?.weather?.relative_humidity ?? '--';
        const currentCond = currentWeather?.weather?.icon ?? 'clear';

        weatherSummary = `
Ort: ${resolvedName}
Aktuelles Wetter:
- Temperatur: ${currentTemp}°C
- Zustand: ${currentCond}
- Windgeschwindigkeit: ${currentWind} km/h
- Luftfeuchtigkeit: ${currentHum}%

3-Tage-Vorhersage:
${forecastSummary}
`;
      } catch (err) {
        console.error('Failed to retrieve weather context for chatbot:', err);
        weatherSummary = `Wetterdaten konnten für "${searchCity}" leider nicht geladen werden.`;
      }
    }

    // Phase 3: Answer Generation
    const finalResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'WeatherDash'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are WeatherDash AI, a helpful weather assistant for the WeatherDash application.
Answering User's query.
Current Location: "${resolvedName}"

Here is the real-time weather and forecast data for the location:
${weatherSummary}

Please answer the user's question accurately based on the provided weather data.
Guidelines:
- Be friendly, conversational, and concise. Keep responses to 3-4 sentences if possible.
- Suggest appropriate clothing or gear (e.g. umbrella, sunglasses, heavy coat, sunscreen) if relevant to the forecast.
- Answer in the same language as the user's query (usually German).
- If no weather data is available because requiresWeather is false, just answer their app-related question.
- Do not make up weather information. If weather data is missing or incomplete, mention it.`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!finalResponse.ok) {
      const errText = await finalResponse.text();
      throw new Error(`OpenRouter answer generation failed: ${finalResponse.status} - ${errText}`);
    }

    const finalData = await finalResponse.json();
    const botReply = finalData.choices[0].message.content.trim();

    return NextResponse.json({ message: botReply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during chat processing' }, { status: 500 });
  }
}
