'use client';

import { Play, Pause, Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import Image from 'next/image';
import { usePlayerStore } from '@/store/store';
import { usePlaylistPlayer, useAudioTime } from '@/hooks/useAudioTime';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { THEME } from '@/themes';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SingleTrackPlayer() {
  const { currentSong } = usePlayerStore();
  const { playPauseTrack, seekTrack } = usePlaylistPlayer();
  const { paused, duration, isLoading } = useGlobalAudioPlayer();
  const currentTime = useAudioTime();

  // Handle click-to-seek on progress bar
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const relativeX = x / rect.width;
      const seekTime = relativeX * duration;
      const clampedTime = Math.max(0, Math.min(seekTime, duration));
      seekTrack(clampedTime);
    },
    [duration, seekTrack]
  );

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div>
          <p className="text-lg text-gray-600 mb-2">No song selected</p>
          <p className="text-sm text-gray-500">
            Select a song from the repertoire to start playing
          </p>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex flex-col ${THEME.bg}`}>
      {/* Header - matches StemPlayerControls */}
      <div
        className={`${THEME.card} border-b ${THEME.border} px-4 py-3 flex items-center gap-3`}
      >
        {/* LP Artwork with Play/Pause */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
            {currentSong.artworkUrl ? (
              <Image
                src={currentSong.artworkUrl}
                alt={currentSong.title}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                ♪
              </div>
            )}
          </div>
          {/* Play/Pause Button Overlay */}
          <button
            onClick={playPauseTrack}
            disabled={isLoading}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all disabled:opacity-50"
          >
            {paused ? (
              <Play className="h-6 w-6 text-white fill-white" />
            ) : (
              <Pause className="h-6 w-6 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Song Title and Time */}
        <div className="flex-1 min-w-0">
          <h1 className={`text-base font-semibold truncate ${THEME.text}`}>
            {currentSong.title}
          </h1>
          {currentSong.artist && (
            <p className={`text-xs ${THEME.textSecondary} truncate`}>
              {currentSong.artist}
            </p>
          )}
          <p className={`text-xs ${THEME.textSecondary} font-mono`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <Loader2 className={`h-4 w-4 animate-spin ${THEME.primary}`} />
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-8">
        <div
          className="relative h-24 bg-zinc-800 rounded-lg cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-red-600/30"
            style={{ width: `${progress}%` }}
          />

          {/* Playhead */}
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${progress}%` }}
            />
          )}

          {/* Decorative waveform pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="flex items-center gap-0.5 h-full py-4">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full"
                  style={{
                    height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 30}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
