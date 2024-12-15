'use client';
import { GigCard } from '@/components/GigCard';
import { Setlist } from '@/components/Setlist';
import { AddPause } from '@/components/AddPause';
import { SongList } from '@/components/SongList';
import React, { useEffect } from 'react';
import { GigType, SongType } from '@/lib/interface';
import { useAllSongsStore, useSongDetailStore } from '@/store/store';
import { MdDelete } from 'react-icons/md';
import { BsPencilSquare } from 'react-icons/bs';
import { removeGig } from '@/actions/sanity';
import { PendingIcon } from '@/components/PendingIcon';

type GigProps = {
  gig: GigType;
  songs: SongType[];
}
export const Gig = ({ gig, songs }: GigProps) => {
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const setSongs = useAllSongsStore(state => state.setSongs);
  const setlist = useSongDetailStore(state => state.setlist);

  const [edit, setEdit] = React.useState(false);

  useEffect(() => {
    setSetlist(gig.setlist);
  }, [gig, setSetlist]);

  useEffect(() => {
    setSongs(getDifferenceBetweenSongLists(
      songs,
      setlist.songs
    ));
  }, [setSongs, songs, setlist]);


  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <div className={'flex w-full px-4 justify-between'}>
        <GigCard gig={gig} />
        <div className={"mt-2 flex gap-4"}>
          {edit && <DeleteIcon gig={gig} />}
          <EditIcon edit={edit} setEdit={setEdit} />
        </div>
      </div>
      <Setlist />
      <AddPause gigId={gig._id} />
      <SongList />
    </div>
  );
};

const getDifferenceBetweenSongLists = (allSongs: SongType[], songs: SongType[]): SongType[] => {
  return allSongs.filter(s => !songs.some(song => song._id === s._id));
};


interface EditIconProps {
  edit: boolean;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditIcon = ({ edit, setEdit }: EditIconProps) => {
  return (
    <button
      className={`w-10 h-10 flex bg-rosePine-highlightLow rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed justify-center ${edit? 'animate-pulse': 'animate-none'}`}
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
      }
      }
    >
      {loading ?
        <PendingIcon /> :
        <MdDelete />
      }
    </button>
  );
};
