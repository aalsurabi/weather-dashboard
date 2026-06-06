import { Cloud, Droplets, Wind, Sun, Moon, CloudRain, CloudLightning, Snowflake, Star, Gauge, Compass } from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: any;
  location: { name: string; lat: number; lon: number };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  todayPrecipitationProbability?: number;
  todayMinTemp?: number;
  todayMaxTemp?: number;
}

const IconMap: Record<string, any> = {
  'clear-day': Sun,
  'clear-night': Moon,
  'partly-cloudy-day': Cloud,
  'partly-cloudy-night': Cloud,
  'cloudy': Cloud,
  'rain': CloudRain,
  'snow': Snowflake,
  'thunderstorm': CloudLightning,
  'fog': Cloud,
};

const ConditionMap: Record<string, string> = {
  'clear-day': 'Sonnig',
  'clear-night': 'Klar',
  'partly-cloudy-day': 'Leicht bewölkt',
  'partly-cloudy-night': 'Leicht bewölkt',
  'cloudy': 'Bewölkt',
  'rain': 'Regen',
  'snow': 'Schneefall',
  'thunderstorm': 'Gewitter',
  'fog': 'Nebel',
  'wind': 'Windig',
  'sleet': 'Schneeregen',
  'hail': 'Hagel',
};

const getWindDirectionDe = (deg: number | null | undefined): string => {
  if (deg === null || deg === undefined) return '';
  const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
};

export default function CurrentWeatherCard({ 
  weather, 
  location, 
  isFavorite = false, 
  onToggleFavorite,
  todayPrecipitationProbability = 0,
  todayMinTemp = 0,
  todayMaxTemp = 0
}: CurrentWeatherCardProps) {
  if (!weather || !location) return null;

  const IconComponent = weather.icon ? (IconMap[weather.icon] || Cloud) : Cloud;
  
  const todaySpan = todayMaxTemp - todayMinTemp;
  const currentPercentage = todaySpan > 0 
    ? Math.max(0, Math.min(100, ((weather.temperature - todayMinTemp) / todaySpan) * 100))
    : 50;

  return (
    <div className="bg-gradient-to-b from-blue-600 to-indigo-900 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl text-white h-full flex flex-col justify-between overflow-hidden relative border border-white/10">
      <div className="absolute -top-16 -right-16 opacity-15 pointer-events-none">
        <IconComponent size={300} />
      </div>

      {/* Top Section */}
      <div className="z-10 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-100 uppercase tracking-widest text-xs sm:text-sm">Aktuelles Wetter</h2>
          <IconComponent size={36} className="text-white drop-shadow-md" />
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="text-7xl sm:text-8xl font-black tracking-tighter drop-shadow-lg leading-none">
            {Math.round(weather.temperature ?? 0)}°C
          </div>
          <div className="text-xl font-medium text-blue-100/90 mt-2 drop-shadow-sm">
            {ConditionMap[weather.icon] || 'Bewölkt'}
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <div className="text-2xl sm:text-3xl font-medium text-blue-50 tracking-wide drop-shadow-sm truncate max-w-[80%]">
              {location.name}
            </div>
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center border border-white/5 active:scale-90"
                aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              >
                <Star 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-blue-100'
                  }`} 
                />
              </button>
            )}
          </div>
        </div>

        {/* Temperature Range Gauge (Apple Weather Detail Style) */}
        <div className="mt-8 bg-white/10 rounded-[1.75rem] p-4.5 backdrop-blur-md border border-white/5 shadow-sm">
          <div className="flex justify-between items-center text-xs text-blue-100 font-semibold mb-2.5">
            <span>Tief: {Math.round(todayMinTemp)}°</span>
            <span className="text-white font-bold">Heute</span>
            <span>Hoch: {Math.round(todayMaxTemp)}°</span>
          </div>
          <div className="h-2.5 bg-black/30 rounded-full relative overflow-visible shadow-inner">
            <div 
              className="absolute h-full rounded-full bg-gradient-to-r from-blue-300 via-indigo-300 to-amber-300"
              style={{
                left: '0%',
                width: '100%'
              }}
            />
            <div 
              className="absolute w-4 h-4 -top-[3px] rounded-full bg-white border-[3px] border-indigo-600 shadow-md z-10"
              style={{
                left: `calc(${currentPercentage}% - 8px)`
              }}
            />
          </div>
        </div>
      </div>

      {/* 2x2 Grid of Weather details */}
      <div className="z-10 relative mt-8 grid grid-cols-2 gap-4">
        {/* Feuchtigkeit */}
        <div className="bg-black/20 rounded-[1.75rem] p-4.5 backdrop-blur-md border border-white/10 shadow-inner flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider">Feuchte</span>
            <Droplets size={16} />
          </div>
          <div>
            <div className="text-2xl font-black">{weather.relative_humidity ?? '--'}%</div>
            <div className="text-[10px] text-blue-200/80 font-medium mt-1">Relative Luftfeuchtigkeit</div>
          </div>
        </div>

        {/* Wind */}
        <div className="bg-black/20 rounded-[1.75rem] p-4.5 backdrop-blur-md border border-white/10 shadow-inner flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wind</span>
            <Wind size={16} />
          </div>
          <div>
            <div className="text-2xl font-black truncate leading-none">
              {Math.round(weather.wind_speed ?? 0)} <span className="text-xs font-bold">km/h</span>
            </div>
            <div className="text-[9px] text-blue-200/80 font-medium mt-1.5 truncate">
              Richtung: {getWindDirectionDe(weather.wind_direction) || '--'} ({weather.wind_direction ?? 0}°)
            </div>
          </div>
        </div>

        {/* Luftdruck */}
        <div className="bg-black/20 rounded-[1.75rem] p-4.5 backdrop-blur-md border border-white/10 shadow-inner flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider">Luftdruck</span>
            <Gauge size={16} />
          </div>
          <div>
            <div className="text-2xl font-black">
              {weather.pressure_msl ? Math.round(weather.pressure_msl) : '--'} <span className="text-xs font-bold">hPa</span>
            </div>
            <div className="text-[10px] text-blue-200/80 font-medium mt-1">Auf Meereshöhe (MSL)</div>
          </div>
        </div>

        {/* Regen (letzte Stunde) */}
        <div className="bg-black/20 rounded-[1.75rem] p-4.5 backdrop-blur-md border border-white/10 shadow-inner flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider">Niederschlag</span>
            <CloudRain size={16} />
          </div>
          <div>
            <div className="text-2xl font-black">
              {(weather.precipitation ?? 0).toFixed(1)} <span className="text-xs font-bold">mm</span>
            </div>
            <div className="text-[9px] text-blue-200/80 font-medium mt-1.5 leading-tight">
              Letzte Std. (Heute max: {todayPrecipitationProbability}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
