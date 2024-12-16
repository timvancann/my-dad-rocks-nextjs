'use client';
import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/store';
import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { SkipBackIcon, SkipForwardIcon } from 'lucide-react';
import { PauseIcon, PlayIcon } from '@sanity/icons';
import { Slider } from '@/components/ui/slider';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';


export default function Player() {
  const selectedSong = usePlayerStore(state => state.currentSong);

  const { previousTrack, nextTrack, playPauseTrack, paused, duration, seekTrack } = usePlaylistPlayer();
  const { loop, looping } = useGlobalAudioPlayer();

  const [progress, setProgress] = useState(0);
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0) {
      setProgress(time / duration * 100);
    }
  }, [time, duration]);

  if (!selectedSong) return (
    <div className="items-center justify-center align-center flex pt-32">
      <h1 className="text-rosePine-text font-bold text-md flex">Selecteer een nummer om te beginnen</h1>
    </div>
  );


  return (
    <div className="items-center flex pt-12 flex-col w-full justify-center">
      <img src={selectedSong.artwork} alt={selectedSong.title} className="w-72 h-72 rounded-xl drop-shadow-md" />
      <div className="flex flex-col items-center justify-center mt-10">
        <h1 className="text-rosePine-text font-bold text-2xl">{selectedSong.title}</h1>
        <h2 className="text-rosePine-text font-normal text-md">{selectedSong.artist}</h2>
      </div>
      <div className="flex flex-row items-center mt-10 justify-center w-full">
        <div className={'flex flex-row items-center gap-6'}>
          <div onClick={previousTrack}>
            <SkipBackIcon className={'w-6 h-6'} />
          </div>
          <div className={'rounded-full bg-rosePine-text text-rosePine-base'} onClick={playPauseTrack}>
            {paused ? <PlayIcon className={'h-20 w-20 pl-2'} /> : <PauseIcon className={'h-20 w-20'} />}
          </div>
          <div onClick={nextTrack}>
            <SkipForwardIcon className={'w-6 h-6'} />
          </div>
        </div>
        <div onClick={() => loop(!looping)} className={'absolute right-6'}>
          {looping ? <TbRepeat className={'w-6 h-6 text-rosePine-love'} /> : <TbRepeatOff className={'w-6 h-6'} />}
        </div>
      </div>

      <div className={'flex px-4 w-full mt-10'}>
        <Slider defaultValue={[33]} max={100} step={1} value={[progress]}
                onValueChange={(value) => {
                  const newTime = (value[0] / 100) * duration;
                  seekTrack(newTime);
                }} />
      </div>
    </div>
  );
}
