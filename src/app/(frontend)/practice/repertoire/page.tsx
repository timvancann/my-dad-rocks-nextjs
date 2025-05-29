'use client';

import { Repertoire } from '@/components/RepertoirePage';
import { usePracticeStore } from '@/context/PracticeProvider';
import { THEME } from '@/themes';
import { NavigationButton } from '@/components/NavigationButton';
import { Plus } from 'lucide-react';

export default function RepertoirePage() {
  const store = usePracticeStore((state) => state);
  const totalDuration = store.allSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const roundedDuration = Math.round(totalDuration / 60);
  return (
    <div className="flex flex-col">
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center">
          <h2 className={`text-lg font-bold ${THEME.primary} mr-2 uppercase tracking-wider`}>Repertoire</h2>
          {/* <div className={`rounded px-1.5 py-0.5 text-xs ${THEME.secondaryBg} font-medium text-zinc-900`}>ROCK</div> */}
        </div>
        <div className="flex items-center gap-3">
          <NavigationButton
            href="/practice/songs/new"
            className={`px-4 py-2 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white rounded-md font-medium transition-colors`}
            icon={<Plus className="h-4 w-4" />}
          >
            Nummer Toevoegen
          </NavigationButton>
          <span className="text-xs text-gray-500">
            • {store.allSongs.length} songs • {roundedDuration} min
          </span>
        </div>
      </div>
      <Repertoire filterSetlist={false} songs={store.allSongs} addSong={store.addSong} setlist={store.setlist} />
    </div>
  );
}
