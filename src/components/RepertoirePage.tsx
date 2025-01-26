import { SetlistType, SongType } from '@/lib/interface';
import React from 'react';
import { Divider } from '@/components/Divider';
import { SongCard } from './SongCard';
import { updateSetlistSongs } from '@/actions/sanity';

type AllSongsProps = {
  filterSetlist: boolean;
  songs: SongType[];
  addSong: (song: SongType) => void;
  setlist: SetlistType;
};

export const Repertoire = ({ filterSetlist, songs, addSong, setlist }: AllSongsProps) => {
  const addToSetlistFn = async (song: SongType) => {
    addSong(song);
    updateSetlistSongs([...setlist.songs, song], setlist._id);
  };

  return (
    <div className={'text-rosePine-text items-center justify-center p-2'}>
      {songs
        .filter((s) => {
          if (!filterSetlist) return true;
          return !setlist.songs.some((song) => song._id === s._id);
        })
        .map((item, index) => (
          <div key={item._id}>
            {index > 0 && <Divider />}
            <SongCard song={item} playlist={songs} addToSetlistFn={() => addToSetlistFn(item)} />
          </div>
        ))}
    </div>
  );
};
