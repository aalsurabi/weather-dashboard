'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-96 relative">
      <div className="relative group">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Stadt oder Postleitzahl suchen..." 
          className="w-full pl-12 pr-5 py-3.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm backdrop-blur-md"
        />
        <div className="absolute left-4 top-3.5 text-slate-400 dark:text-zinc-400 group-focus-within:text-blue-500 transition-colors">
          <Search size={20} />
        </div>
      </div>
    </form>
  );
}
