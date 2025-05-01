'use client';

import { removeGig } from '@/actions/sanity';
import { AddPause } from '@/components/AddPause';
import { GigCard } from '@/components/GigCard';
import { PendingIcon } from '@/components/PendingIcon';
import { Setlist } from '@/components/Setlist';
import GigProvider, { useGigStore } from '@/context/GigProvider';
import { usePracticeStore } from '@/context/PracticeProvider';
import { GigType } from '@/lib/interface';
import React from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { SongsTitle } from './PlaylistTitle';
import { Repertoire } from './RepertoirePage';

type GigProps = {
  gig: GigType;
};
export const Gig = ({ gig }: GigProps) => {
  const allSongs = usePracticeStore((state) => state.allSongs);

  return (
    <div className="flex flex-col">
      <div className={'flex w-full justify-between px-4'}>
        <GigCard gig={gig} />
      </div>
      <GigProvider setlist={gig.setlist} allSongs={allSongs}>
        <Content />
      </GigProvider>
    </div>
  );
};

const Content = () => {
  const store = useGigStore((state) => state);

  return (
    <>
      <Setlist setlist={store.setlist} removeSong={store.removeSong} updateSongsInSetlist={store.updateSongsInSetlist} />
      <AddPause addSong={store.addSong} setlist={store.setlist} />
      <SongsTitle title={'Repertoire'} />
      <Repertoire songs={store.allSongs} setlist={store.setlist} addSong={store.addSong} filterSetlist={true} />
    </>
  );
};

interface EditIconProps {
  edit: boolean;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditIcon = ({ edit, setEdit }: EditIconProps) => {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center gap-2 rounded-xl border border-rosePine-highlightMed bg-rosePine-highlightLow p-2 drop-shadow-lg ${edit ? 'animate-pulse' : 'animate-none'}`}
      onClick={() => setEdit(!edit)}
    >
      <BsPencilSquare />
    </button>
  );
};

interface DeleteIconProps {
  gig: GigType;
}

const DeleteIcon = ({ gig }: DeleteIconProps) => {
  const [loading, setLoading] = React.useState(false);
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center gap-2 rounded-xl border border-rosePine-love bg-rosePine-highlightLow p-2 text-rosePine-love drop-shadow-lg`}
      onClick={async () => {
        setLoading(true);
        await removeGig(gig);
      }}
    >
      {loading ? <PendingIcon /> : <MdDelete />}
    </button>
  );
};
