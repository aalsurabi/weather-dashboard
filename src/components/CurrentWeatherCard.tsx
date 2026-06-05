import React from 'react';
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudLightning, Snowflake, Star } from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: any;
  location: { name: string; lat: number; lon: number };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const IconMap: Record<string, any> = {
  'clear-day': Sun,
  'clear-night': Sun,
  'partly-cloudy-day': Cloud,
  'partly-cloudy-night': Cloud,
  'cloudy': Cloud,
  'rain': CloudRain,
  'snow': Snowflake,
  'thunderstorm': CloudLightning,
  'fog': Cloud,
};

export default function CurrentWeatherCard({ 
  weather, 
  location, 
  isFavorite = false, 
  onToggleFavorite 
}: CurrentWeatherCardProps) {
  if (!weather || !location) return null;

  const IconComponent = weather.icon ? (IconMap[weather.icon] || Cloud) : Cloud;

  return (
    <div className="bg-gradient-to-b from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 shadow-2xl text-white h-full flex flex-col justify-between overflow-hidden relative">
      <div className="absolute -top-16 -right-16 opacity-20 pointer-events-none">
        <IconComponent size={300} />
      </div>

      <div className="z-10 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-blue-100 uppercase tracking-widest text-sm">Aktuelles Wetter</h2>
          <IconComponent size={36} className="text-white drop-shadow-md" />
        </div>

        <div className="mt-16">
          <div className="text-8xl font-black tracking-tighter drop-shadow-lg">
            {Math.round(weather.temperature ?? 0)}°C
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="text-3xl font-medium text-blue-50 tracking-wide drop-shadow-sm truncate max-w-[80%]">
              {location.name}
            </div>
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center border border-white/5 active:scale-90"
                aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              >
                <Star 
                  size={20} 
                  className={`transition-colors duration-300 ${
                    isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-blue-100'
                  }`} 
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="z-10 relative mt-16 flex items-center justify-between bg-black/20 rounded-[2rem] p-6 backdrop-blur-md border border-white/10 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-2xl">
            <Droplets size={22} className="text-blue-100" />
          </div>
          <div>
            <div className="text-sm text-blue-200 font-medium">Luftfeuchtigkeit</div>
            <div className="font-bold text-xl">{weather.relative_humidity ?? '--'}%</div>
          </div>
        </div>

        <div className="w-px h-12 bg-white/10"></div>

        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-2xl">
            <Wind size={22} className="text-blue-100" />
          </div>
          <div>
            <div className="text-sm text-blue-200 font-medium">Wind</div>
            <div className="font-bold text-xl">{weather.wind_speed ?? weather.wind_speed_10 ?? '--'} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
