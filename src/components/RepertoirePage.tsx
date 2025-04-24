import { updateSetlistSongs } from '@/actions/sanity';
import { Divider } from '@/components/Divider';
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
    <div className={'mb-16 items-center justify-center p-2 text-rosePine-text'}>
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
