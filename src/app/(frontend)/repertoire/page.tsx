'use client';

import { SongsTitle } from '@/components/PlaylistTitle';
import { Repertoire } from '@/components/RepertoirePage';
import { usePracticeStore } from '@/context/PracticeProvider';

export default function RepertoirePage() {
  const store = usePracticeStore((state) => state);
  return (
    <div className="flex flex-col">
      <SongsTitle title={'Repertoire'} />
      <Repertoire filterSetlist={false} songs={store.allSongs} addSong={store.addSong} setlist={store.setlist} />
    </div>
  );
}
