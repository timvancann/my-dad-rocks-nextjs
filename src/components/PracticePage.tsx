'use client';
import { SetlistType } from '@/lib/interface';
import { useSongDetailStore } from '@/store/store';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Setlist } from '@/components/Setlist';
import { useEffect } from 'react';

type PracticeProps = {
  setlist: SetlistType;
};
export const PracticePage = ({ setlist }: PracticeProps) => {
  const setSetlist = useSongDetailStore(state => state.setSetlist);

  useEffect(() => {
    setSetlist(setlist);
  }, [setlist, setSetlist]);

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <SongsTitle title={'Oefenlijst'} />
      <Setlist />
    </div>
  );
};
