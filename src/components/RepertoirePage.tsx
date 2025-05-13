import { updateSetlistSongs } from '@/actions/sanity';
import { SetlistType, SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
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
  const selectedSong = usePlayerStore((state) => state.currentSong);

  return (
    <div className={'flex flex-col space-y-2'}>
      {songs
        .filter((s) => {
          if (!filterSetlist) return true;
          return !setlist.songs.some((song) => song._id === s._id);
        })
        .map((item, index) => (
          <div
            key={index}
            className={`relative rounded-lg shadow-lg ${item._id === selectedSong?._id ? THEME.cardActive : THEME.card} overflow-hidden border transition-all ${item._id === selectedSong?._id ? 'border-red-900/30' : 'border-zinc-800/30'}`}
          >
            {item._id === selectedSong?._id && <div className="absolute right-0 top-0 -mr-12 -mt-12 h-24 w-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/5 blur-xl"></div>}
            <div className="relative flex items-center p-1">
              <SongCard key={item._id} song={item} playlist={songs} addToSetlistFn={() => addToSetlistFn(item)} />
            </div>
          </div>
        ))}
    </div>
  );
};
