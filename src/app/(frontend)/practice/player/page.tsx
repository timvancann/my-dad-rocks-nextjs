'use client';
import { Slider } from '@/components/ui/slider';
import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { FileText, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Player() {
  const selectedSong = usePlayerStore((state) => state.currentSong);

  const { previousTrack, nextTrack, playPauseTrack, paused, duration, seekTrack, isLoading } = usePlaylistPlayer();

  const [progress, setProgress] = useState(0);
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0) {
      setProgress((time / duration) * 100);
    }
  }, [time, duration]);

  if (!selectedSong || !selectedSong.audio)
    return (
      <div className="align-center flex items-center justify-center pt-32">
        <h1 className="text-md flex font-bold text-rosePine-text">Selecteer een nummer om te beginnen</h1>
      </div>
    );

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8 mt-4">
        {/* Vinyl record behind album */}
        <div className="absolute inset-0 -m-4 rounded-full bg-black shadow-xl"></div>

        {/* Spinning vinyl grooves */}
        <div className="absolute inset-0 -m-4 animate-spin rounded-full bg-zinc-800/30 opacity-30" style={{ animationDuration: '10s' }}></div>

        <img src={selectedSong.artwork} alt={selectedSong.title} className="aspect-square relative z-10 h-60 w-60 rounded-md shadow-2xl" />

        {/* Center hole of vinyl */}
        <div className="absolute left-1/2 top-1/2 z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900"></div>
      </div>
      <h2 className={`mb-1 text-2xl font-bold ${THEME.primary}`}>{selectedSong.title}</h2>
      <p className="mb-1 text-gray-300">{selectedSong.artist}</p>
      <div className="mt-8 flex w-full justify-center gap-8">
        <Link className="p-2 text-gray-300" href={`/practice/lyrics/${selectedSong._id}`}>
          <FileText className="h-5 w-5" />
        </Link>
      </div>

      <div className="fixed bottom-36 left-0 right-0 px-5 pb-8 pt-3">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs text-gray-400">
            <span>{new Date(time * 1000).toISOString().slice(15, 19)}</span>
            <span>{new Date(duration * 1000).toISOString().slice(15, 19)}</span>
          </div>
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
        <div className="flex items-center justify-between">
          <div className="flex w-14 justify-center">
            <button className="cursor-pointer p-2" onClick={previousTrack}>
              <SkipBack className="h-6 w-6 text-gray-300" />
            </button>
          </div>

          <button className={`${THEME.primaryBg} cursor-pointer rounded-full p-4 shadow-lg shadow-red-900/30`} onClick={playPauseTrack}>
            {!paused ? <Pause className="h-8 w-8 text-white" /> : <Play className="ml-1 h-8 w-8 text-white" />}
          </button>

          <div className="flex w-14 justify-center">
            <button className="cursor-pointer p-2" onClick={nextTrack}>
              <SkipForward className="h-6 w-6 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
