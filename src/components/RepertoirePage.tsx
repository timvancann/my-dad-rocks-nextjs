import { updateSetlistSongs } from '@/actions/sanity';
import { SetlistType, SongType } from '@/lib/interface';
import { SongCard } from './SongCard';

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
    <div className={'flex flex-col'}>
      {songs
        .filter((s) => {
          if (!filterSetlist) return true;
          return !setlist.songs.some((song) => song._id === s._id);
        })
        .map((item, index) => (
          <SongCard key={item._id} song={item} playlist={songs} addToSetlistFn={() => addToSetlistFn(item)} />
        ))}
    </div>
  );
};
