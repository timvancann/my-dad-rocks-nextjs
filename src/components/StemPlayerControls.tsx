'use client';

import { Play, Pause, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import Image from 'next/image';
import type { Stem } from '@/types/stems';
import {
  inferStemCategory,
  sortStemsByCategory,
  STEM_SOLO_BG,
} from '@/types/stems';
import { useStemPlayer } from '@/hooks/useStemPlayer';
import { StemTrackIcon } from '@/components/StemTrackIcons';
import { StemWaveformTrack } from '@/components/StemWaveformTrack';
import { THEME } from '@/themes';

interface StemPlayerControlsProps {
  stems: Stem[];
  songTitle: string;
  artworkUrl?: string | null;
  slug: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function StemPlayerControls({
  stems,
  songTitle,
  artworkUrl,
  slug,
}: StemPlayerControlsProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    mutedStems,
    soloStem,
    isLoading,
    loadingProgress,
    play,
    pause,
    seek,
    toggleMute,
    toggleSolo,
  } = useStemPlayer(stems);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleWaveformSeek = (time: number) => {
    seek(time);
  };

  // Sort stems by category
  const sortedStems = sortStemsByCategory(stems);

  if (stems.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div>
          <p className="text-lg text-gray-600 mb-2">
            No stems available for this song
          </p>
          <p className="text-sm text-gray-500">
            Upload stem files (vocals, drums, bass, guitar, etc.) to use the
            multi-track player
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${THEME.bg}`}>
      {/* Compact Header */}
      <div
        className={`${THEME.card} border-b ${THEME.border} px-4 py-3 flex items-center gap-3`}
      >
        {/* Back Button */}
        <Link href={`/practice/song/${slug}`}>
          <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        {/* LP Artwork with Play/Pause */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt={songTitle}
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
            onClick={handlePlayPause}
            disabled={isLoading}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white fill-white" />
            ) : (
              <Play className="h-6 w-6 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Song Title and Time */}
        <div className="flex-1 min-w-0">
          <h1 className={`text-base font-semibold truncate ${THEME.text}`}>
            {songTitle}
          </h1>
          <p className={`text-xs ${THEME.textSecondary} font-mono`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className={`h-4 w-4 animate-spin ${THEME.primary}`} />
            <span className={`text-xs ${THEME.textSecondary}`}>
              {Object.values(loadingProgress).filter(Boolean).length}/
              {stems.length}
            </span>
          </div>
        )}
      </div>

      {/* Two-Panel Layout: Controls (left) + Waveforms (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div
          className={`w-14 flex-shrink-0 border-r ${THEME.border} overflow-y-auto`}
        >
          <div className="py-2">
            {sortedStems.map((stem) => {
              const category = inferStemCategory(stem.title);
              const isMuted = soloStem
                ? soloStem !== stem.id
                : mutedStems.has(stem.id);
              const isSolo = soloStem === stem.id;
              const isLoaded = loadingProgress[stem.id] ?? false;
              const soloBgClass = STEM_SOLO_BG[category];

              return (
                <div
                  key={stem.id}
                  className={`h-12 flex flex-col items-center justify-center gap-0.5 border-b ${THEME.border} ${
                    isSolo ? soloBgClass : ''
                  } ${isMuted && !isSolo ? 'opacity-40' : ''}`}
                >
                  {/* Icon */}
                  <StemTrackIcon category={category} size={18} />

                  {/* M/S Buttons */}
                  <div className="flex gap-0.5">
                    <Button
                      onClick={() => toggleMute(stem.id)}
                      variant="ghost"
                      size="sm"
                      className={`h-5 w-5 p-0 text-[9px] font-bold ${
                        isMuted && !soloStem
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : `${THEME.text} hover:bg-zinc-700`
                      }`}
                      disabled={isLoading || !isLoaded}
                    >
                      M
                    </Button>
                    <Button
                      onClick={() => toggleSolo(stem.id)}
                      variant="ghost"
                      size="sm"
                      className={`h-5 w-5 p-0 text-[9px] font-bold ${
                        isSolo
                          ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                          : `${THEME.text} hover:bg-zinc-700`
                      }`}
                      disabled={isLoading || !isLoaded}
                    >
                      S
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Waveforms */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Unified Playhead */}
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          )}

          <div className="py-2">
            {sortedStems.map((stem) => {
              const category = inferStemCategory(stem.title);
              const isMuted = soloStem
                ? soloStem !== stem.id
                : mutedStems.has(stem.id);
              const isSolo = soloStem === stem.id;
              const isLoaded = loadingProgress[stem.id] ?? false;
              const soloBgClass = STEM_SOLO_BG[category];

              return (
                <div
                  key={stem.id}
                  className={`h-12 border-b ${THEME.border} ${
                    isSolo ? soloBgClass : ''
                  } ${isMuted && !isSolo ? 'opacity-40' : ''}`}
                >
                  <StemWaveformTrack
                    stem={stem}
                    category={category}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleWaveformSeek}
                    isLoading={isLoading || !isLoaded}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className={`px-4 py-3 ${THEME.card} border-t ${THEME.border}`}>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={isLoading}
        />
        <div
          className={`flex justify-between text-xs ${THEME.textSecondary} mt-1 font-mono`}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
