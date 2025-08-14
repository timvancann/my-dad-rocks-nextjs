import { useEffect, useMemo, useState } from 'react';
import { SongType } from '@/lib/interface';

interface UseSongSearchParams {
  songs: SongType[];
  searchTerm: string;
  excludeSongs: SongType[];
  debounceMs?: number;
}

interface UseSongSearchReturn {
  filteredSongs: SongType[];
  isSearching: boolean;
  debouncedSearchTerm: string;
}

export function useSongSearch({
  songs,
  searchTerm,
  excludeSongs,
  debounceMs = 300,
}: UseSongSearchParams): UseSongSearchReturn {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debounceMs, debouncedSearchTerm]);

  // Create a set of excluded song IDs for efficient lookups
  const excludedSongIds = useMemo(() => {
    return new Set(excludeSongs.map(song => song._id));
  }, [excludeSongs]);

  // Filter and search songs
  const filteredSongs = useMemo(() => {
    // First filter out excluded songs
    const availableSongs = songs.filter(song => !excludedSongIds.has(song._id));

    // If no search term, return all available songs
    if (!debouncedSearchTerm.trim()) {
      return availableSongs;
    }

    // Perform case-insensitive fuzzy search on title and artist
    const searchTermLower = debouncedSearchTerm.toLowerCase().trim();
    
    return availableSongs.filter(song => {
      const titleMatch = song.title.toLowerCase().includes(searchTermLower);
      const artistMatch = song.artist?.toLowerCase().includes(searchTermLower) || false;
      
      return titleMatch || artistMatch;
    });
  }, [songs, debouncedSearchTerm, excludedSongIds]);

  return {
    filteredSongs,
    isSearching,
    debouncedSearchTerm,
  };
}