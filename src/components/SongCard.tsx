'use client';

import { SongDetailDrawer } from '@/components/Drawer';
import { usePlaylistPlayer } from '@/hooks/useAudioTime';
import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';

interface SongCardProps {
  song: SongType;
  playlist: SongType[];
  removeFromSetlistFn?: () => void;
  addToSetlistFn?: () => void;
}

export const SongCard = ({ song, playlist, removeFromSetlistFn, addToSetlistFn }: SongCardProps) => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSelectedSong = usePlayerStore((state) => state.setCurrentSong);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);

  const isSelected = selectedSong?.title === song.title;

  const { playTrack } = usePlaylistPlayer();

  return (
    <div className={`flex grow flex-col gap-1 rounded-xl px-3 py-0 ${isSelected ? 'bg-rosePine-overlay' : 'bg-transparent'}`}>
      <div className={'flex flex-row items-center justify-between'}>
        <div
          className={`flex cursor-pointer flex-row items-center`}
          onClick={async () => {
            setPlaylist(playlist);
            await playTrack(song);
            setSelectedSong(song);
          }}
        >
          <img src={`${song.artwork}?h=64`} alt={song.title} className={`m-1 mr-2 h-16 w-16 p-1 ${isSelected ? 'border border-rosePine-gold' : 'border-0'}`} />
          <div className={'mr-6'}>
            <h1 className={`${isSelected ? 'font-extrabold text-rosePine-gold' : 'font-bold text-rosePine-text'}`}>{song.title}</h1>
            <h2 className={`text-sm ${isSelected ? 'font-bold text-rosePine-gold' : 'font-normal text-rosePine-text'}`}>{song.artist}</h2>
          </div>
        </div>
        <SongDetailDrawer song={song} removeFromSetlistFn={removeFromSetlistFn} addToSetlistFn={addToSetlistFn} />
      </div>
    </div>
  );
};
