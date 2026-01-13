'use client';

import { Play, Pause, Volume2, VolumeX, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import Image from 'next/image';
import type { Stem } from '@/types/stems';
import { inferStemCategory, STEM_COLORS, sortStemsByCategory } from '@/types/stems';
import { useStemPlayer } from '@/hooks/useStemPlayer';
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

export function StemPlayerControls({ stems, songTitle, artworkUrl, slug }: StemPlayerControlsProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    mutedStems,
    soloStem,
    volume,
    isLoading,
    loadingProgress,
    play,
    pause,
    seek,
    toggleMute,
    toggleSolo,
    setStemVolume,
    muteAll,
    unmuteAll,
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

  // Sort stems by category
  const sortedStems = sortStemsByCategory(stems);

  if (stems.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div>
          <p className="text-lg text-gray-600 mb-2">No stems available for this song</p>
          <p className="text-sm text-gray-500">
            Upload stem files (vocals, drums, bass, guitar, etc.) to use the multi-track player
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${THEME.bg}`}>
      {/* Compact Header */}
      <div className={`${THEME.card} border-b ${THEME.border} px-4 py-3 flex items-center gap-3`}>
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

        {/* Song Title */}
        <div className="flex-1 min-w-0">
          <h1 className={`text-base font-semibold truncate ${THEME.text}`}>{songTitle}</h1>
          <p className={`text-xs ${THEME.textSecondary}`}>Multi-track</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={`${THEME.highlight} border-b ${THEME.border} px-4 py-2 flex items-center gap-2`}>
          <Loader2 className={`h-4 w-4 animate-spin ${THEME.primary}`} />
          <p className={`text-xs ${THEME.textSecondary}`}>
            Loading {Object.values(loadingProgress).filter(Boolean).length}/{stems.length} stems...
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`px-4 py-3 ${THEME.card} border-b ${THEME.border}`}>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={isLoading}
        />
        <div className={`flex justify-between text-xs ${THEME.textSecondary} mt-1`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Global Controls */}
      <div className={`px-4 py-2 ${THEME.card} border-b ${THEME.border} flex gap-2`}>
        <Button onClick={unmuteAll} variant="outline" size="sm" disabled={isLoading} className={`flex-1 text-xs h-8 ${THEME.border} ${THEME.text} hover:${THEME.highlight}`}>
          Unmute All
        </Button>
        <Button onClick={muteAll} variant="outline" size="sm" disabled={isLoading} className={`flex-1 text-xs h-8 ${THEME.border} ${THEME.text} hover:${THEME.highlight}`}>
          Mute All
        </Button>
      </div>

      {/* Stem Tracks - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 space-y-3">
          {sortedStems.map((stem) => {
            const category = inferStemCategory(stem.title);
            const colorClass = STEM_COLORS[category];
            const isMuted = soloStem ? soloStem !== stem.id : mutedStems.has(stem.id);
            const isSolo = soloStem === stem.id;
            const stemVolume = volume[stem.id] ?? 1.0;
            const isLoaded = loadingProgress[stem.id] ?? false;

            // Format category name for display
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

            return (
              <div
                key={stem.id}
                className={`rounded-lg border ${THEME.border} p-3 transition-all ${
                  isMuted ? `opacity-50 ${THEME.highlight}` : THEME.highlight
                } ${isSolo ? 'ring-2 ring-red-600' : ''}`}
              >
                {/* Line 1: Stem Type with Color Indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                  <h3 className={`font-medium text-sm ${THEME.text}`}>{categoryName}</h3>
                  {!isLoaded && (
                    <span className={`text-xs ${THEME.textSecondary} ml-auto`}>Loading...</span>
                  )}
                </div>

                {/* Line 2: Volume, Mute, Solo Controls */}
                <div className="flex items-center gap-2">
                  {/* Volume Control */}
                  <div className="flex-1 flex items-center gap-2">
                    <Volume2 className={`h-3 w-3 ${THEME.textSecondary} flex-shrink-0`} />
                    <Slider
                      value={[stemVolume * 100]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setStemVolume(stem.id, value[0] / 100)}
                      className="flex-1"
                      disabled={isLoading || !isLoaded}
                    />
                  </div>

                  {/* Solo Button */}
                  <Button
                    onClick={() => toggleSolo(stem.id)}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-12 text-xs p-0 ${THEME.border} hover:${THEME.highlight} ${
                      isSolo ? `${THEME.primaryBg} ${THEME.text} border-red-600` : THEME.text
                    }`}
                    disabled={isLoading || !isLoaded}
                  >
                    S
                  </Button>

                  {/* Mute Button */}
                  <Button
                    onClick={() => toggleMute(stem.id)}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-12 text-xs p-0 ${THEME.border} hover:${THEME.highlight} ${
                      isMuted && !soloStem ? `${THEME.secondaryBg} ${THEME.text} border-amber-600` : THEME.text
                    }`}
                    disabled={isLoading || !isLoaded}
                  >
                    {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
