import React from 'react';
import { format } from 'date-fns';
import { Cloud, Sun, Moon, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

const IconMap: Record<string, any> = {
  'clear-day': Sun,
  'clear-night': Moon,
  'partly-cloudy-day': Cloud,
  'partly-cloudy-night': Cloud,
  'cloudy': Cloud,
  'rain': CloudRain,
  'snow': Snowflake,
  'thunderstorm': CloudLightning,
};

interface HourlyTimelineProps {
  forecast: any[];
}

export default function HourlyTimeline({ forecast }: HourlyTimelineProps) {
  if (!forecast || forecast.length === 0) return null;

  const now = new Date();
  const next24Hours = forecast.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= now && itemDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }).slice(0, 24);

  return (
    <div className="bg-white/70 dark:bg-zinc-900/60 rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-2xl transition-colors duration-300">
      <h2 className="text-xl font-bold mb-8 text-slate-800 dark:text-zinc-100 tracking-wide transition-colors duration-300">Stündliche Vorhersage</h2>
      
      {/* 
        Using a custom scrollbar style class for webkit to hide the scrollbar but keep functionality.
      */}
      <div className="flex overflow-x-auto gap-5 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {next24Hours.map((item, i) => {
          const IconComp = item.icon ? (IconMap[item.icon] || Cloud) : Cloud;
          const time = i === 0 ? 'Jetzt' : format(new Date(item.timestamp), 'HH:mm');
          
          return (
            <div 
              key={item.timestamp} 
              className={`flex flex-col items-center justify-center min-w-[90px] py-6 px-4 rounded-[1.5rem] border transition-all snap-start ${
                i === 0 
                  ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-white/50 border-slate-200/50 hover:bg-slate-100/80 dark:bg-zinc-800/40 dark:border-zinc-700/30 dark:hover:bg-zinc-700/50'
              }`}
            >
              <div className={`text-sm mb-4 font-medium transition-colors duration-300 ${i === 0 ? 'text-blue-100' : 'text-slate-400 dark:text-zinc-400'}`}>
                {time}
              </div>
              <IconComp size={28} className={`transition-colors duration-300 ${i === 0 ? 'text-white drop-shadow' : 'text-slate-600 dark:text-zinc-300'}`} />
              
              <div className="h-4 flex items-center justify-center mt-1 mb-2 select-none">
                {item.precipitation_probability !== null && item.precipitation_probability !== undefined && item.precipitation_probability > 0 ? (
                  <span className={`text-[10px] font-bold ${i === 0 ? 'text-blue-100' : 'text-blue-500 dark:text-blue-400'} leading-none`}>
                    {item.precipitation_probability}%
                  </span>
                ) : (
                  <span className="text-[10px] opacity-0 leading-none">0%</span>
                )}
              </div>

              <div className={`text-xl font-bold transition-colors duration-300 ${i === 0 ? 'text-white' : 'text-slate-800 dark:text-zinc-100'}`}>
                {Math.round(item.temperature ?? 0)}°
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
