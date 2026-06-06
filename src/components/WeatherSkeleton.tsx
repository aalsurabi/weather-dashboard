import React from 'react';

export default function WeatherSkeleton() {
  return (
    <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch pb-10 w-full">
      {/* Left Column Skeleton: CurrentWeatherCard equivalent */}
      <div className="xl:col-span-4 h-full min-h-[600px] xl:min-h-[750px]">
        <div className="bg-gradient-to-b from-blue-600/90 to-indigo-900/90 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl h-full flex flex-col justify-between overflow-hidden relative border border-white/10 animate-pulse">
          
          {/* Top Section */}
          <div className="z-10 relative">
            <div className="flex items-center justify-between">
              {/* "Aktuelles Wetter" Label */}
              <div className="h-4 bg-white/20 rounded w-28 sm:w-32" />
              {/* Icon Placeholder */}
              <div className="h-9 w-9 bg-white/20 rounded-full" />
            </div>

            <div className="mt-8">
              {/* Temperature Placeholder */}
              <div className="h-20 bg-white/25 rounded-3xl w-40" />
              {/* Condition Text Placeholder */}
              <div className="h-6 bg-white/20 rounded w-28 mt-4" />
              
              <div className="flex items-center gap-3 mt-5">
                {/* Location Name Placeholder */}
                <div className="h-8 bg-white/25 rounded-2xl w-48" />
                {/* Favorite Star Placeholder */}
                <div className="h-9 w-9 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Apple Weather Detail Style Gauge Placeholder */}
            <div className="mt-8 bg-white/10 rounded-[1.75rem] p-4.5 border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <div className="h-3 bg-white/20 rounded w-12" />
                <div className="h-3 bg-white/25 rounded w-10" />
                <div className="h-3 bg-white/20 rounded w-12" />
              </div>
              <div className="h-2.5 bg-black/20 rounded-full w-full" />
            </div>
          </div>

          {/* 2x2 Grid of Weather details */}
          <div className="z-10 relative mt-8 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="bg-black/15 rounded-[1.75rem] p-4.5 border border-white/5 flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-white/20 rounded w-10" />
                  <div className="h-4 w-4 bg-white/20 rounded-full" />
                </div>
                <div>
                  <div className="h-6 bg-white/25 rounded w-16" />
                  <div className="h-3 bg-white/10 rounded w-20 mt-2" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
      {/* Right Column Skeleton: HourlyTimeline and ForecastChart equivalent */}
      <div className="xl:col-span-8 flex flex-col gap-8 h-full">
        
        {/* HourlyTimeline Skeleton */}
        <div className="bg-white/50 dark:bg-zinc-900/40 rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200/60 dark:border-zinc-800/40 backdrop-blur-2xl animate-pulse">
          {/* Header */}
          <div className="h-5 bg-slate-300 dark:bg-zinc-800 rounded w-44 mb-8" />
          
          {/* Scrollable Timeline items */}
          <div className="flex overflow-x-auto gap-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center justify-center min-w-[90px] py-6 px-4 rounded-[1.5rem] border ${
                  i === 0 
                    ? 'bg-blue-600/10 border-blue-500/20' 
                    : 'bg-white/50 border-slate-200/50 dark:bg-zinc-850/40 dark:border-zinc-800/30'
                }`}
              >
                {/* Time */}
                <div className="h-3.5 bg-slate-300 dark:bg-zinc-850 rounded w-10 mb-4" />
                {/* Icon */}
                <div className="h-7 w-7 bg-slate-300 dark:bg-zinc-850 rounded-full mb-3" />
                {/* Precip Prob */}
                <div className="h-3 bg-slate-200 dark:bg-zinc-900 rounded w-6 mb-2" />
                {/* Temp */}
                <div className="h-5 bg-slate-300 dark:bg-zinc-850 rounded w-8" />
              </div>
            ))}
          </div>
        </div>

        {/* ForecastChart Skeleton */}
        <div className="bg-white/50 dark:bg-zinc-900/40 rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200/60 dark:border-zinc-800/40 backdrop-blur-2xl animate-pulse flex-1 flex flex-col min-h-[350px]">
          {/* Header */}
          <div className="h-5 bg-slate-300 dark:bg-zinc-800 rounded w-40 mb-6" />
          
          {/* Daily Rows */}
          <div className="flex-1 flex flex-col justify-between">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 py-3.5 border-b border-slate-100/50 dark:border-zinc-800/30 last:border-b-0"
              >
                {/* Day Name */}
                <div className="h-4 bg-slate-300 dark:bg-zinc-850 rounded w-14 sm:w-16" />
                
                {/* Icon & Rain */}
                <div className="w-12 sm:w-14 flex flex-col items-center justify-center gap-1">
                  <div className="h-5 w-5 bg-slate-300 dark:bg-zinc-850 rounded-full" />
                  <div className="h-2.5 bg-slate-200 dark:bg-zinc-900 rounded w-6" />
                </div>
                
                {/* Temp Min */}
                <div className="h-4 bg-slate-200 dark:bg-zinc-850 rounded w-8 text-right" />
                
                {/* Slider Track */}
                <div className="flex-1 h-2 bg-slate-200 dark:bg-zinc-800/60 rounded-full" />
                
                {/* Temp Max */}
                <div className="h-4 bg-slate-300 dark:bg-zinc-850 rounded w-8" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
