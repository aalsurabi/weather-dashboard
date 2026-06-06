'use client';

import React, { useMemo } from 'react';
import { Sun, Moon, Cloud, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

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

interface ForecastChartProps {
  forecast: any[];
  theme?: 'light' | 'dark';
  currentTemp?: number;
}

export default function ForecastChart({ forecast, theme, currentTemp }: ForecastChartProps) {
  const { days, overallMin, overallMax, overallSpan } = useMemo(() => {
    if (!forecast || forecast.length === 0) {
      return { days: [], overallMin: 0, overallMax: 0, overallSpan: 0 };
    }

    const dailyMap = new Map<string, {
      date: Date,
      temps: number[],
      rainProbs: number[],
      icons: string[]
    }>();

    forecast.forEach(item => {
      if (item.temperature === null || item.temperature === undefined) return;
      
      const date = new Date(item.timestamp);
      const dateKey = date.toDateString();
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date,
          temps: [item.temperature],
          rainProbs: item.precipitation_probability !== null && item.precipitation_probability !== undefined ? [item.precipitation_probability] : [0],
          icons: item.icon ? [item.icon] : []
        });
      } else {
        const existing = dailyMap.get(dateKey)!;
        existing.temps.push(item.temperature);
        if (item.precipitation_probability !== null && item.precipitation_probability !== undefined) {
          existing.rainProbs.push(item.precipitation_probability);
        }
        if (item.icon) {
          existing.icons.push(item.icon);
        }
      }
    });

    const parsedDays = Array.from(dailyMap.values()).slice(0, 7).map((dayData, index) => {
      const minTemp = Math.min(...dayData.temps);
      const maxTemp = Math.max(...dayData.temps);
      const maxRain = dayData.rainProbs.length ? Math.max(...dayData.rainProbs) : 0;
      
      const iconCounts = dayData.icons.reduce((acc: Record<string, number>, icon) => {
        acc[icon] = (acc[icon] || 0) + 1;
        return acc;
      }, {});
      const mainIcon = Object.entries(iconCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'clear-day';

      let dayName = '';
      if (index === 0) {
        dayName = 'Heute';
      } else {
        const shortName = dayData.date.toLocaleDateString('de-DE', { weekday: 'short' });
        dayName = shortName.replace('.', '');
      }

      return {
        dayName,
        minTemp,
        maxTemp,
        maxRain,
        icon: mainIcon,
        isToday: index === 0
      };
    });

    const allMinTemps = parsedDays.map(d => d.minTemp);
    const allMaxTemps = parsedDays.map(d => d.maxTemp);
    const min = allMinTemps.length ? Math.min(...allMinTemps) : 0;
    const max = allMaxTemps.length ? Math.max(...allMaxTemps) : 100;
    const span = max - min;

    return { days: parsedDays, overallMin: min, overallMax: max, overallSpan: span };
  }, [forecast]);

  if (days.length === 0) return null;

  return (
    <div className="bg-white/70 dark:bg-zinc-900/60 rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-2xl h-full flex flex-col min-h-[350px] transition-colors duration-300">
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-zinc-100 tracking-wide transition-colors duration-300">7-Tage-Vorhersage</h2>
      
      <div className="flex-1 flex flex-col justify-between select-none">
        {days.map((d, index) => {
          const IconComponent = IconMap[d.icon] || Cloud;
          const leftPercent = overallSpan > 0 ? ((d.minTemp - overallMin) / overallSpan) * 100 : 0;
          const widthPercent = overallSpan > 0 ? ((d.maxTemp - d.minTemp) / overallSpan) * 100 : 100;
          
          const clampedTemp = currentTemp !== undefined ? Math.max(d.minTemp, Math.min(d.maxTemp, currentTemp)) : d.minTemp;
          const currentTempPercent = overallSpan > 0 ? ((clampedTemp - overallMin) / overallSpan) * 100 : 0;

          return (
            <div 
              key={index} 
              className="flex items-center gap-4 py-3 sm:py-3.5 border-b border-slate-100/50 dark:border-zinc-800/30 last:border-b-0"
            >
              {/* Day Name */}
              <span className="w-14 sm:w-16 text-sm sm:text-base font-semibold text-slate-700 dark:text-zinc-300 transition-colors duration-300">
                {d.dayName}
              </span>
              
              {/* Icon & Rain */}
              <div className="w-12 sm:w-14 flex flex-col items-center justify-center">
                <IconComponent size={20} className="text-blue-500 dark:text-blue-400 drop-shadow-sm transition-colors duration-300" />
                {d.maxRain > 0 && (
                  <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 mt-0.5 leading-none">
                    {d.maxRain}%
                  </span>
                )}
              </div>
              
              {/* Daily Min Temp */}
              <span className="w-8 sm:w-10 text-right text-slate-400 dark:text-zinc-400 font-semibold text-xs sm:text-sm transition-colors duration-300">
                {Math.round(d.minTemp)}°
              </span>
              
              {/* Temperature Slider Range Track */}
              <div className="flex-1 h-2 bg-slate-200/50 dark:bg-zinc-800/60 rounded-full relative overflow-visible shadow-inner">
                {/* Active Day Range */}
                <div 
                  className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 shadow-sm"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`
                  }}
                />
                {/* Current temperature marker (Today only) */}
                {d.isToday && currentTemp !== undefined && (
                  <div 
                    className="absolute w-3.5 h-3.5 -top-[3px] rounded-full bg-white border-2 border-indigo-600 dark:border-blue-500 shadow-md z-10 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    style={{
                      left: `calc(${currentTempPercent}% - 7px)`
                    }}
                    title={`Aktuell: ${Math.round(currentTemp)}°C`}
                  />
                )}
              </div>
              
              {/* Daily Max Temp */}
              <span className="w-8 sm:w-10 text-left text-slate-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm transition-colors duration-300">
                {Math.round(d.maxTemp)}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
