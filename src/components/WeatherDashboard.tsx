'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import CurrentWeatherCard from './CurrentWeatherCard';
import HourlyTimeline from './HourlyTimeline';
import ForecastChart from './ForecastChart';
import { Loader2, Sun, Moon, Star, Navigation } from 'lucide-react';
import ChatbotPopup from './ChatbotPopup';

interface FavoriteLocation {
  name: string;
  query: string;
}

export default function WeatherDashboard() {
  const [city, setCity] = useState('Berlin');
  const [currentQuery, setCurrentQuery] = useState('Berlin');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [mounted, setMounted] = useState(false);
  const [geolocating, setGeolocating] = useState(false);

  // Read theme and favorites from localStorage or system preferences on mount
  useEffect(() => {
    setMounted(true);
    
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }

    const storedFavs = localStorage.getItem('favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  // Update theme class on HTML element when theme changes
  useEffect(() => {
    if (!mounted) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme, mounted]);

  // Persist favorites to localStorage when changed
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites, mounted]);

  const fetchWeather = async (searchCity: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(searchCity)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }
      
      setWeatherData(data);
      setCity(data.location.name);
      setCurrentQuery(searchCity);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Berlin');
  }, []);

  const handleSearch = (newCity: string) => {
    fetchWeather(newCity);
  };

  const handleGeolocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGeolocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const queryStr = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        handleSearch(queryStr);
        setGeolocating(false);
      },
      (err) => {
        let errMsg = 'Failed to get your location.';
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = 'Location access denied. Please enable location permissions in your browser.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          errMsg = 'Location request timed out.';
        }
        setError(errMsg);
        setGeolocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const toggleFavorite = () => {
    if (!weatherData) return;
    const name = weatherData.location.name;
    const query = currentQuery;
    const exists = favorites.some(fav => fav.name === name);
    if (exists) {
      setFavorites(favorites.filter(fav => fav.name !== name));
    } else {
      setFavorites([...favorites, { name, query }]);
    }
  };

  const removeFavorite = (name: string) => {
    setFavorites(favorites.filter(fav => fav.name !== name));
  };

  const isCurrentFavorite = weatherData ? favorites.some(fav => fav.name === weatherData.location.name) : false;

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center selection:bg-blue-500/30 transition-colors duration-300">
      <div className="w-full max-w-[1500px] flex flex-col gap-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 py-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2 select-none">
            rumble <span className="text-blue-500">Weather Dashboard</span>
          </h1>
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <SearchBar onSearch={handleSearch} />
            <button
              onClick={handleGeolocation}
              disabled={geolocating || loading}
              className="p-3.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 text-slate-800 dark:text-gray-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-md cursor-pointer flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800/80 disabled:opacity-50"
              title="Use current location"
              aria-label="Use current location"
            >
              <Navigation className={`h-5 w-5 text-blue-500 transition-all duration-300 ${geolocating ? 'animate-pulse scale-110 rotate-45' : ''}`} />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 text-slate-800 dark:text-gray-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-md cursor-pointer flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800/80"
              aria-label="Toggle Theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500 transition-transform duration-500 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600 transition-transform duration-500 rotate-0 hover:-rotate-12" />
              )}
            </button>
          </div>
        </header>

        {mounted && favorites.length > 0 && (
          <div className="flex flex-wrap gap-2.5 items-center bg-white/40 dark:bg-zinc-900/30 border border-slate-200/50 dark:border-zinc-800/30 p-3.5 rounded-3xl backdrop-blur-md transition-all duration-300">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mr-1 select-none">
              <Star size={14} className="fill-yellow-400 text-yellow-400" /> Favoriten
            </span>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav) => (
                <div 
                  key={fav.name}
                  className="group flex items-center bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-full pl-3.5 pr-1.5 py-1.5 shadow-sm hover:shadow hover:scale-102 transition-all duration-300 gap-1.5"
                >
                  <button
                    onClick={() => handleSearch(fav.query)}
                    className="text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
                  >
                    {fav.name}
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.name)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer flex items-center justify-center"
                    aria-label={`Remove ${fav.name} from favorites`}
                  >
                    <span className="text-[10px] font-black block leading-none px-0.5">✕</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 text-red-400 border border-red-900/50 rounded-2xl p-6 text-center text-lg font-medium backdrop-blur-sm">
            {error}
          </div>
        )}

        {loading && !weatherData ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-blue-500" size={56} />
            <p className="text-zinc-500 font-medium">Wetterdaten werden geladen...</p>
          </div>
        ) : weatherData ? (() => {
          let todayPrecipitationProbability = 0;
          let todayMinTemp = weatherData.currentWeather?.temperature ?? 0;
          let todayMaxTemp = weatherData.currentWeather?.temperature ?? 0;

          if (weatherData.forecast && weatherData.forecast.length > 0) {
            const todayStr = new Date().toDateString();
            const todayForecast = weatherData.forecast.filter((item: any) => {
              return new Date(item.timestamp).toDateString() === todayStr;
            });
            if (todayForecast.length > 0) {
              const rainProbs = todayForecast
                .map((item: any) => item.precipitation_probability)
                .filter((val: any) => val !== null && val !== undefined);
              if (rainProbs.length > 0) {
                todayPrecipitationProbability = Math.max(...rainProbs);
              }

              const temps = todayForecast
                .map((item: any) => item.temperature)
                .filter((val: any) => val !== null && val !== undefined);
              if (temps.length > 0) {
                todayMinTemp = Math.min(...temps);
                todayMaxTemp = Math.max(...temps);
              }
            } else {
              todayPrecipitationProbability = weatherData.forecast[0].precipitation_probability ?? 0;
              todayMinTemp = weatherData.forecast[0].temperature ?? todayMinTemp;
              todayMaxTemp = weatherData.forecast[0].temperature ?? todayMaxTemp;
            }
          }
          return (
            <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch pb-10">
              {/* Left Tall Card */}
              <div className="xl:col-span-4 h-full min-h-[600px] xl:min-h-[750px]">
                <CurrentWeatherCard 
                  weather={weatherData.currentWeather} 
                  location={weatherData.location} 
                  isFavorite={isCurrentFavorite}
                  onToggleFavorite={toggleFavorite}
                  todayPrecipitationProbability={todayPrecipitationProbability}
                  todayMinTemp={todayMinTemp}
                  todayMaxTemp={todayMaxTemp}
                />
              </div>
              
              {/* Right Stack */}
              <div className="xl:col-span-8 flex flex-col gap-8 h-full">
                <HourlyTimeline forecast={weatherData.forecast} />
                <div className="flex-1">
                  <ForecastChart 
                    forecast={weatherData.forecast} 
                    theme={theme} 
                    currentTemp={weatherData.currentWeather?.temperature}
                  />
                </div>
              </div>
            </main>
          );
        })() : null}
      </div>
      <ChatbotPopup currentCity={city} />
    </div>
  );
}
