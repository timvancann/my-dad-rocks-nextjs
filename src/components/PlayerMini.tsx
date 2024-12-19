'use client';

import React, { useEffect, useState } from 'react';
import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { PauseCircleIcon, PlayCircleIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react';


export const PlayerMini = () => {
  const selectedSong = usePlayerStore(state => state.currentSong);

  const { previousTrack, nextTrack, playPauseTrack, paused, duration } = usePlaylistPlayer();

  const [progress, setProgress] = useState(0);
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0) {
      setProgress(time / duration * 100);
    }
  }, [time, duration]);

  if (!selectedSong) return null;

  return (
    <div
      className={`fixed  bottom-16 w-full  bg-rosePineMoon-highlightLow bg-opacity-50 backdrop-blur-2xl backdrop-filter rounded-2xl border-y-rosePine-highlightMed z-20 shadow-lg`}
    >
      <div className={'flex-col'}>
        <div className={'flex grow flex-row justify-between items-center mr-4'}>
          <div className={'flex flex-row items-center'}>
            <img src={selectedSong.artwork} alt={selectedSong.title} className={'w-12 h-12 m-1 p-1 ml-2'} />
            <div className={'flex flex-col justify-between'}>
              <div className={'text-sm font-bold'}>{selectedSong.title}</div>
              <div className={'text-xs'}>{selectedSong.artist}</div>
            </div>

          </div>
          <div className={'flex flex-row items-center gap-4'}>
            <div onClick={previousTrack}>
              <SkipBackIcon />
            </div>
            <div className={''} onClick={playPauseTrack}>
              {paused ? <PlayCircleIcon className={'h-8 w-8'} /> : <PauseCircleIcon className={'h-8 w-8'} />}
            </div>
            <div onClick={nextTrack}>
              <SkipForwardIcon />
            </div>
          </div>

        </div>
        <div>
          <div className=" mx-4 rounded-full h-[2px] bg-rosePine-highlightMed">
            <div className="bg-rosePine-love h-[2px] rounded-full" style={{ width: progress + '%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
