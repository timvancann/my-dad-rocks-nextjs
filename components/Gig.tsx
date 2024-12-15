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
        <EditIcon edit={edit} setEdit={setEdit} />
        {edit && <DeleteIcon gig={gig} />}
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
    <button className={'bg-rosePine-highlightLow rounded-xl p-2 m-2'}
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
  return (
    <button className={'bg-rosePine-love rounded-xl p-2 m-2 text-rosePine-base'}
            onClick={async () =>
              await removeGig(gig)
            }
    >
      <MdDelete />
    </button>
  );
};
