'use client';

import { SongDetailDrawer } from '@/components/Drawer';
import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import Image from 'next/image';
import { TbGuitarPickFilled, TbMicrophoneFilled } from 'react-icons/tb';

interface SongCardProps {
  song: SongType;
  playlist: SongType[];
  removeFromSetlistFn?: () => void;
  addToSetlistFn?: () => void;
}

export const SongCard = ({ song, playlist, removeFromSetlistFn, addToSetlistFn }: SongCardProps) => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSongIndex = usePlayerStore((state) => state.setSongIndex);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);

  const isSelected = selectedSong?._id === song._id;
  let selectedStyle = isSelected ? 'bg-rosePine-overlay' : 'bg-transparent';

  return (
    <div
      className={`flex flex-row items-center justify-between px-2 cursor-pointer ${selectedStyle}`}
      onClick={() => {
        const currentIndex = playlist.findIndex((s) => s._id === song._id);
        setPlaylist(playlist);
        setSongIndex(currentIndex);
      }}
    >
      <div className={`flex flex-row items-center `}>
        <Image src={`${song.artwork}`} alt={song.title} width={64} height={64} className={`my-2 mr-4 h-16 w-16 rounded-sm p-[1px] shadow-md ${isSelected ? 'border-rosePine-gold' : ''}`} />
        <div className={'mr-6 flex flex-col'}>
          <h1 className={`${isSelected ? 'font-sm font-bold text-rosePine-gold' : 'font-bold text-rosePine-text'}`}>{song.title}</h1>
          <h2 className={`text-xs ${isSelected ? 'font text-rosePine-gold' : 'font-normal text-rosePine-text'}`}>{song.artist}</h2>
          <div className="mt-1 flex gap-1 align-middle">
            {song.dualGuitar && <TbGuitarPickFilled className="text-rosePine-love" />}
            {song.dualVocal && <TbMicrophoneFilled className="text-rosePine-gold" />}
          </div>
        </div>
      </div>
      <SongDetailDrawer song={song} removeFromSetlistFn={removeFromSetlistFn} addToSetlistFn={addToSetlistFn} />
    </div>
  );
};
