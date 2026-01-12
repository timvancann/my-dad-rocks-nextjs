'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Headphones, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import type { Stem } from '@/types/stems';
import { inferStemCategory, STEM_COLORS } from '@/types/stems';
import { useStemPlayer } from '@/hooks/useStemPlayer';

interface StemPlayerControlsProps {
  stems: Stem[];
  songTitle: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function StemPlayerControls({ stems, songTitle }: StemPlayerControlsProps) {
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
    <div className="space-y-6">
      {/* Song Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1">{songTitle}</h1>
        <p className="text-sm text-gray-600">Multi-track Stem Player</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Loading stems...</p>
              <p className="text-xs text-blue-700 mt-1">
                {Object.values(loadingProgress).filter(Boolean).length} of {stems.length} stems ready
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Playback Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Play/Pause Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePlayPause}
                disabled={isLoading}
                size="lg"
                className="w-32 h-32 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-12 w-12" />
                ) : (
                  <Play className="h-12 w-12" />
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Global Controls */}
            <div className="flex justify-center gap-2">
              <Button onClick={unmuteAll} variant="outline" size="sm" disabled={isLoading}>
                Unmute All
              </Button>
              <Button onClick={muteAll} variant="outline" size="sm" disabled={isLoading}>
                Mute All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stem Tracks */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tracks</h2>
        {stems.map((stem) => {
          const category = inferStemCategory(stem.title);
          const colorClass = STEM_COLORS[category];
          const isMuted = soloStem ? soloStem !== stem.id : mutedStems.has(stem.id);
          const isSolo = soloStem === stem.id;
          const stemVolume = volume[stem.id] ?? 1.0;
          const isLoaded = loadingProgress[stem.id] ?? false;

          return (
            <Card
              key={stem.id}
              className={`transition-all ${
                isMuted ? 'opacity-50 bg-gray-50' : ''
              } ${isSolo ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Stem Color Indicator */}
                  <div className={`w-3 h-12 rounded ${colorClass}`} />

                  {/* Stem Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{stem.title}</h3>
                    {stem.description && (
                      <p className="text-xs text-gray-500 truncate">{stem.description}</p>
                    )}
                    {!isLoaded && (
                      <p className="text-xs text-gray-400 mt-1">Loading...</p>
                    )}
                  </div>

                  {/* Volume Control */}
                  <div className="w-32 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
                    variant={isSolo ? 'default' : 'outline'}
                    size="sm"
                    className="w-16"
                    disabled={isLoading || !isLoaded}
                  >
                    <Headphones className="h-4 w-4 mr-1" />
                    S
                  </Button>

                  {/* Mute Button */}
                  <Button
                    onClick={() => toggleMute(stem.id)}
                    variant={isMuted && !soloStem ? 'default' : 'outline'}
                    size="sm"
                    className="w-16"
                    disabled={isLoading || !isLoaded}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="h-4 w-4 mr-1" />
                        M
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-1" />
                        M
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2 text-sm">How to use:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Click M to mute/unmute individual tracks</li>
            <li>• Click S to solo a track (mutes all others)</li>
            <li>• Use the sliders to adjust individual track volumes</li>
            <li>• All tracks play simultaneously in sync</li>
            <li>• Practice your part while hearing the rest of the band!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
