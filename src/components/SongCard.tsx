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

  const isSelected = selectedSong?.title === song.title;

  return (
    <div className={`flex grow flex-col gap-1 rounded-xl px-3 py-0 ${isSelected ? 'bg-rosePine-overlay' : 'bg-transparent'}`}>
      <div className={'flex flex-row items-center justify-between'}>
        <div
          className={`flex cursor-pointer flex-row items-center`}
          onClick={() => {
            const currentIndex = playlist.findIndex((s) => s._id === song._id);
            setPlaylist(playlist);
            setSongIndex(currentIndex);
          }}
        >
          <Image
            src={`${song.artwork}?h=64`}
            alt={song.title}
            width={64}
            height={64}
            className={`m-1 mr-2 h-16 w-16 rounded-lg border-[1px] border-rosePine-subtle/40 p-[1px] shadow-md ${isSelected ? 'outline outline-offset-2 outline-rosePine-gold' : ''}`}
          />
          <div className={'mr-6'}>
            <h1 className={`${isSelected ? 'font-extrabold text-rosePine-gold' : 'font-bold text-rosePine-text'}`}>{song.title}</h1>
            <h2 className={`text-sm ${isSelected ? 'font-bold text-rosePine-gold' : 'font-normal text-rosePine-text'}`}>{song.artist}</h2>
            <div className="flex gap-1 align-middle">
              {song.dualGuitar && <TbGuitarPickFilled className="text-rosePine-love" />}
              {song.dualVocal && <TbMicrophoneFilled className="text-rosePine-gold" />}
            </div>
          </div>
        </div>
        <SongDetailDrawer song={song} removeFromSetlistFn={removeFromSetlistFn} addToSetlistFn={addToSetlistFn} />
      </div>
    </div>
  );
};
