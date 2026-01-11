'use client';

import { Repertoire } from '@/components/RepertoirePage';
import { usePracticeStore } from '@/context/PracticeProvider';
import { THEME } from '@/themes';
import { NavigationButton } from '@/components/NavigationButton';
import { Plus, Search, Guitar, Mic, UserMinus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { fuzzyIncludes } from '@/lib/fuzzySearch';
import { TbGuitarPickFilled } from 'react-icons/tb';

export default function RepertoirePage() {
  const store = usePracticeStore((state) => state);
  const totalDuration = store.allSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const roundedDuration = Math.round(totalDuration / 60);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDualGuitar, setFilterDualGuitar] = useState<boolean | null>(null);
  const [filterDualVocal, setFilterDualVocal] = useState<boolean | null>(null);
  const [filterCanPlayWithoutSinger, setFilterCanPlayWithoutSinger] = useState<boolean | null>(null);

  const filteredSongs = useMemo(() => {
    let songs = store.allSongs;

    // Apply arrangement filters
    if (filterDualGuitar !== null) {
      songs = songs.filter(song => song.dualGuitar === filterDualGuitar);
    }
    if (filterDualVocal !== null) {
      songs = songs.filter(song => song.dualVocal === filterDualVocal);
    }
    if (filterCanPlayWithoutSinger !== null) {
      songs = songs.filter(song => song.canPlayWithoutSinger === filterCanPlayWithoutSinger);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      songs = songs.filter((song) => {
        const title = song.title ?? '';
        const artist = song.artist ?? '';
        return fuzzyIncludes(`${title} ${artist}`, searchTerm);
      });
    }

    return songs;
  }, [searchTerm, store.allSongs, filterDualGuitar, filterDualVocal, filterCanPlayWithoutSinger]);

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center">
          <h2 className={`text-lg font-bold ${THEME.primary} mr-2 uppercase tracking-wider`}>Repertoire</h2>
          {/* <div className={`rounded px-1.5 py-0.5 text-xs ${THEME.secondaryBg} font-medium text-zinc-900`}>ROCK</div> */}
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <NavigationButton
            href="/practice/songs/new"
            className={`px-4 py-2 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white rounded-md font-medium transition-colors sm:w-auto`}
            icon={<Plus className="h-4 w-4" />}
          >
            Nummer Toevoegen
          </NavigationButton>
          <span className="text-xs text-gray-500 sm:text-right">
            • {store.allSongs.length} songs • {roundedDuration} min
          </span>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 shadow-inner">
        <label htmlFor="repertoire-search" className="sr-only">
          Filter repertoire
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="repertoire-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Filter on song title, artist, or both..."
            className="w-full rounded-md border border-transparent bg-zinc-800/70 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-red-700 focus:bg-zinc-900 focus:outline-none"
            autoComplete="off"
          />
        </div>

        {/* Filter Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterDualGuitar(filterDualGuitar === true ? null : true)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              filterDualGuitar === true
                ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600/50'
                : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            <TbGuitarPickFilled className="h-4 w-4" />
            Dubbele Gitaar
          </button>

          <button
            onClick={() => setFilterDualVocal(filterDualVocal === true ? null : true)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              filterDualVocal === true
                ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600/50'
                : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            <Mic className="h-4 w-4" />
            Dubbele Zang
          </button>

          <button
            onClick={() => setFilterCanPlayWithoutSinger(filterCanPlayWithoutSinger === true ? null : true)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              filterCanPlayWithoutSinger === true
                ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600/50'
                : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            <UserMinus className="h-4 w-4" />
            Speelbaar zonder zanger
          </button>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Showing {filteredSongs.length} of {store.allSongs.length} songs
        </p>
      </div>
      <Repertoire filterSetlist={false} songs={filteredSongs} addSong={store.addSong} setlist={store.setlist} />
    </div>
  );
}
