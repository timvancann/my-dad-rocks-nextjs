'use client';

import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { PauseCircleIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImSpinner7 } from 'react-icons/im';

export const PlayerMini = () => {
  const selectedSong = usePlayerStore((state) => state.currentSong);

  const { previousTrack, nextTrack, playPauseTrack, paused, duration, isLoading } = usePlaylistPlayer();

  const [progress, setProgress] = useState(0);
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0) {
      setProgress((time / duration) * 100);
    }
  }, [time, duration]);

  if (!selectedSong) return null;

  return (
    <div className={`w-full rounded-xl border-[1px] border-rosePine-text/20 bg-rosePineMoon-highlightLow shadow-lg backdrop-blur-2xl backdrop-filter`}>
      <div className={'flex flex-col py-1 gap-1'}>
        <div className={'mr-4 flex grow flex-row items-center justify-between pt-1'}>
          <div className={'flex flex-row items-center'}>
            {isLoading ? (
              <div className={'m-1 ml-2 rounded-full p-1'}>
                <ImSpinner7 className="h-8 w-8 animate-spin text-rosePine-love" />
              </div>
            ) : (
              <img src={selectedSong.artwork} alt={selectedSong.title} className={' rounded-md ml-2 h-12 w-12'}></img>
            )}
            <div className={'flex flex-col justify-between'}>
              <div className={'text-sm font-bold'}>{selectedSong.title}</div>
              <div className={'text-xs'}>{selectedSong.artist}</div>
            </div>
          </div>
          <div className={'flex flex-row items-center gap-4'}>
            <button onClick={previousTrack}>
              <SkipBackIcon />
            </button>
            <button className={''} onClick={playPauseTrack}>
              {paused ? <PlayCircleIcon className={'h-8 w-8'} /> : <PauseCircleIcon className={'h-8 w-8'} />}
            </button>
            <button onClick={nextTrack}>
              <SkipForwardIcon />
            </button>
          </div>
        </div>
        <div>
          <div className='mx-4 bg-rosePine-love/10'>
            <div className="h-[1px] bg-rosePine-love" style={{ width: progress + '%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
