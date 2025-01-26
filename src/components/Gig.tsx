'use client';

import { GigCard } from '@/components/GigCard';
import { Setlist } from '@/components/Setlist';
import { AddPause } from '@/components/AddPause';
import React from 'react';
import { GigType } from '@/lib/interface';
import { MdDelete } from 'react-icons/md';
import { BsPencilSquare } from 'react-icons/bs';
import { removeGig } from '@/actions/sanity';
import { PendingIcon } from '@/components/PendingIcon';
import { usePracticeStore } from '@/context/PracticeProvider';
import GigProvider, { useGigStore } from '@/context/GigProvider';
import { Repertoire } from './RepertoirePage';
import { SongsTitle } from './PlaylistTitle';

type GigProps = {
  gig: GigType;
};
export const Gig = ({ gig }: GigProps) => {
  const allSongs = usePracticeStore((state) => state.allSongs);

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <div className={'flex w-full px-4 justify-between'}>
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
      className={`w-10 h-10 flex bg-rosePine-highlightLow rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed justify-center ${edit ? 'animate-pulse' : 'animate-none'}`}
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
      className={`w-10 h-10 justify-center flex bg-rosePine-highlightLow rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-love text-rosePine-love`}
      onClick={async () => {
        setLoading(true);
        await removeGig(gig);
      }}
    >
      {loading ? <PendingIcon /> : <MdDelete />}
    </button>
  );
};
