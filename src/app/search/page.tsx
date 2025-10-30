'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { getPopular, getSearchResults, Title } from '@/lib/data';
import { AnimeCard } from '@/components/anime-card';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const popular = getPopular();
  const searchResults = getSearchResults(query);

  const itemsToShow = query ? searchResults : popular;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Search Titles</h2>
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for anime or manga..."
          className="w-full rounded-lg bg-background pl-10 h-12 text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-4">
        {itemsToShow.map((item) => (
          <AnimeCard key={item.id} item={item} />
        ))}
      </div>
        {query && itemsToShow.length === 0 && (
            <div className="text-center col-span-full py-16">
                <p className="text-muted-foreground">No results found for "{query}".</p>
            </div>
        )}
    </div>
  );
}
