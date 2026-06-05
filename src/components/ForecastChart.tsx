'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ForecastChartProps {
  forecast: any[];
  theme?: 'light' | 'dark';
}

export default function ForecastChart({ forecast, theme }: ForecastChartProps) {
  const chartData = useMemo(() => {
    if (!forecast || forecast.length === 0) return [];
    
    const dailyMap = new Map<string, { date: string, minTemp: number, maxTemp: number }>();
    
    forecast.forEach(item => {
      if (item.temperature === null || item.temperature === undefined) return;
      
      const dateKey = format(new Date(item.timestamp), 'MMM dd');
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, minTemp: item.temperature, maxTemp: item.temperature });
      } else {
        const existing = dailyMap.get(dateKey)!;
        dailyMap.set(dateKey, {
          date: dateKey,
          minTemp: Math.min(existing.minTemp, item.temperature),
          maxTemp: Math.max(existing.maxTemp, item.temperature)
        });
      }
    });
    
    return Array.from(dailyMap.values()).slice(0, 7);
  }, [forecast]);

  const isDark = theme === 'dark';
  const tickColor = isDark ? '#71717a' : '#64748b'; // zinc-500 vs slate-500
  const tooltipBg = isDark ? '#18181b' : '#ffffff';
  const tooltipBorder = isDark ? '1px solid #27272a' : '1px solid #e2e8f0';
  const tooltipText = isDark ? '#f4f4f5' : '#0f172a';
  const tooltipLabel = isDark ? '#a1a1aa' : '#64748b';
  const cursorStroke = isDark ? '#3f3f46' : '#cbd5e1';
  const dotStroke = isDark ? '#18181b' : '#ffffff';

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white/70 dark:bg-zinc-900/60 rounded-[2.5rem] p-8 shadow-xl border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-2xl h-full flex flex-col min-h-[350px] transition-colors duration-300">
      <h2 className="text-xl font-bold mb-8 text-slate-800 dark:text-zinc-100 tracking-wide transition-colors duration-300">7-Tage-Vorhersage</h2>
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMaxTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: tickColor, fontSize: 13, fontWeight: 500 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: tickColor, fontSize: 13, fontWeight: 500 }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderRadius: '16px', 
                border: tooltipBorder, 
                color: tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)'
              }}
              itemStyle={{ color: tooltipText, fontWeight: 600 }}
              labelStyle={{ color: tooltipLabel, marginBottom: '4px' }}
              cursor={{ stroke: cursorStroke, strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area 
              type="monotone" 
              dataKey="maxTemp" 
              stroke="#3b82f6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorMaxTemp)" 
              name="Höchsttemp. (°C)"
              activeDot={{ r: 6, fill: '#3b82f6', stroke: dotStroke, strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="minTemp" 
              stroke="#60a5fa" 
              strokeWidth={3}
              strokeDasharray="6 6"
              fill="transparent" 
              name="Tiefsttemp. (°C)"
              activeDot={{ r: 6, fill: '#60a5fa', stroke: dotStroke, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
