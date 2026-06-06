'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Film, Building, Trees, ExternalLink, 
  Compass, Loader2, BookOpen, Sparkles, Coffee, Eye 
} from 'lucide-react';

interface RecommendedPOI {
  id: number;
  type: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, string>;
}

interface LocalRecommendationsProps {
  city: string;
}

const CategoryIconMap: Record<string, any> = {
  'Museum': Building,
  'Kino': Film,
  'Park': Trees,
  'Garten': Trees,
  'Burg / Schloss': Compass,
  'Bibliothek': BookOpen,
  'Theater': Sparkles,
  'Café': Coffee,
  'Zoo': MapPin,
  'Aussichtspunkt': Eye,
};

export default function LocalRecommendations({ city }: LocalRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedPOI[]>([]);
  const [weatherDescription, setWeatherDescription] = useState('passen perfekt zur aktuellen Wetterlage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!city) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/recommend-activity?city=${encodeURIComponent(city)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Fehler beim Laden der Empfehlungen.');
        }

        setRecommendations(data.recommendations || []);
        if (data.weather?.descriptionText) {
          setWeatherDescription(data.weather.descriptionText);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Empfehlungen konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [city]);

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-zinc-900/60 rounded-[2.5rem] p-8 shadow-xl border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-2xl flex flex-col items-center justify-center min-h-[200px] gap-3 select-none">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-slate-500 dark:text-zinc-400 text-xs font-semibold">
          Suche nach passenden lokalen Aktivitäten in {city}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 shadow-xl border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-2xl text-center select-none text-red-500 text-sm font-semibold">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white/70 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-xl border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-2xl transition-colors duration-300">
      <div className="flex items-center justify-between mb-8 select-none">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-wide">
            Lokale Insider-Tipps in {city}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold">
            Diese 6 Vorschläge {weatherDescription}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((poi) => {
          const IconComponent = CategoryIconMap[poi.category] || MapPin;
          const mapLink = `https://www.openstreetmap.org/${poi.type}/${poi.id}`;

          return (
            <div 
              key={poi.id}
              className="group flex flex-col justify-between bg-white/50 border border-slate-200/50 dark:bg-zinc-800/30 dark:border-zinc-800/60 rounded-3xl p-5.5 hover:scale-103 hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div>
                {/* Category Badge & Icon */}
                <div className="flex justify-between items-center select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {poi.category}
                  </span>
                  <IconComponent size={16} className="text-slate-400 dark:text-zinc-500 group-hover:scale-110 transition-transform" />
                </div>

                {/* Name */}
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 mt-4 leading-snug select-text line-clamp-2 min-h-[3rem]">
                  {poi.name}
                </h3>
              </div>

              {/* Action Button & Metadata */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-850 flex items-center justify-between select-none">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Koordinaten</span>
                  <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-semibold mt-0.5">
                    {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}
                  </span>
                </div>

                <a 
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/10 rounded-2xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all cursor-pointer"
                >
                  <span>Karte</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
