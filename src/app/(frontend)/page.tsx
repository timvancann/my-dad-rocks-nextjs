'use client';

import { SongsTitle } from '@/components/PlaylistTitle';
import { Setlist } from '@/components/Setlist';
import { usePracticeStore } from '@/context/PracticeProvider';

export default function Home() {
  const store = usePracticeStore((state) => state);

  return (
    <div className="items-center justify-center md:flex md:flex-col">
      <SongsTitle title={'Oefenlijst'} />
      <Setlist setlist={store.setlist} removeSong={store.removeSong} updateSongsInSetlist={store.updateSongsInSetlist} />
    </div>
  );
}
