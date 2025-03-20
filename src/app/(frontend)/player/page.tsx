'use client';
import { Slider } from '@/components/ui/slider';
import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { PauseCircleIcon } from '@heroicons/react/16/solid';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { SkipBackIcon, SkipForwardIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImSpinner7 } from 'react-icons/im';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';
import { useGlobalAudioPlayer } from 'react-use-audio-player';

export default function Player() {
  const selectedSong = usePlayerStore((state) => state.currentSong);

  const { previousTrack, nextTrack, playPauseTrack, paused, duration, seekTrack, isLoading } = usePlaylistPlayer();
  const { loop, looping } = useGlobalAudioPlayer();

  const [progress, setProgress] = useState(0);
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0) {
      setProgress((time / duration) * 100);
    }
  }, [time, duration]);

  if (!selectedSong)
    return (
      <div className="align-center flex items-center justify-center pt-32">
        <h1 className="text-md flex font-bold text-rosePine-text">Selecteer een nummer om te beginnen</h1>
      </div>
    );

  return (
    <div className="flex w-full flex-col items-center justify-center pt-12">
      {isLoading ? (
        <div className={'m-1 ml-2 rounded-full p-1'}>
          <ImSpinner7 className="h-16 w-16 animate-pulse animate-spin text-rosePine-love" />
        </div>
      ) : (
        <img src={selectedSong.artwork} alt={selectedSong.title} className="h-72 w-72 rounded-xl drop-shadow-md" />
      )}
      <div className="mt-10 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-rosePine-text">{selectedSong.title}</h1>
        <h2 className="text-md font-normal text-rosePine-text">{selectedSong.artist}</h2>
      </div>
      <div className="mt-10 flex w-full flex-row items-center justify-center">
        <div className={'flex flex-row items-center gap-6'}>
          <div onClick={async() => await previousTrack()}>
            <SkipBackIcon className={'h-6 w-6'} />
          </div>
          <div className={'rounded-full bg-rosePine-text text-rosePine-base'} onClick={playPauseTrack}>
            {paused ? <PlayCircleIcon className={'h-20 w-20 pl-2'} /> : <PauseCircleIcon className={'h-20 w-20'} />}
          </div>
          <div onClick={async() => await nextTrack()}>
            <SkipForwardIcon className={'h-6 w-6'} />
          </div>
        </div>
        <div onClick={() => loop(!looping)} className={'absolute right-6'}>
          {looping ? <TbRepeat className={'h-6 w-6 text-rosePine-love'} /> : <TbRepeatOff className={'h-6 w-6'} />}
        </div>
      </div>

      <div className={'mt-10 flex w-full px-4'}>
        <Slider
          defaultValue={[33]}
          max={100}
          step={1}
          value={[progress]}
          onValueChange={(value) => {
            const newTime = (value[0] / 100) * duration;
            seekTrack(newTime);
          }}
        />
      </div>
    </div>
  );
}
