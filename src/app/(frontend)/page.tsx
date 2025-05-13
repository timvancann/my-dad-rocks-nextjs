'use client';

import { Setlist } from '@/components/Setlist';
import { usePracticeStore } from '@/context/PracticeProvider';
import { THEME } from '@/themes';

export default function Home() {
  const store = usePracticeStore((state) => state);
  const totalDuration = store.setlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const roundedDuration = Math.round(totalDuration / 60);

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center">
          <h2 className={`text-lg font-bold ${THEME.primary} mr-2 uppercase tracking-wider`}>Oefenlijst</h2>
          {/* <div className={`rounded px-1.5 py-0.5 text-xs ${THEME.secondaryBg} font-medium text-zinc-900`}>ROCK</div> */}
        </div>
        <span className="text-xs text-gray-500">
          • {store.setlist.songs.length} songs • {roundedDuration} min
        </span>
      </div>
      <Setlist setlist={store.setlist} removeSong={store.removeSong} updateSongsInSetlist={store.updateSongsInSetlist} />
    </div>
  );
}
