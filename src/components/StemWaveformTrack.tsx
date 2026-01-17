'use client';

import { useWavesurfer } from '@wavesurfer/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Stem, StemCategory } from '@/types/stems';
import { STEM_WAVEFORM_COLORS } from '@/types/stems';

interface StemWaveformTrackProps {
  stem: Stem;
  category: StemCategory;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isLoading: boolean;
  onWaveformReady?: () => void;
}

export function StemWaveformTrack({
  stem,
  category,
  currentTime,
  duration,
  onSeek,
  isLoading,
  onWaveformReady,
}: StemWaveformTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformReady, setWaveformReady] = useState(false);
  const colors = STEM_WAVEFORM_COLORS[category];

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: stem.url,
    waveColor: colors.wave,
    progressColor: colors.progress,
    cursorColor: 'transparent', // We'll use a unified playhead instead
    cursorWidth: 0,
    barWidth: 2,
    barRadius: 1,
    barGap: 1,
    height: 48,
    normalize: true,
    interact: false, // Disable built-in interaction, we handle click-to-seek manually
    hideScrollbar: true,
    autoCenter: false,
    autoScroll: false,
    minPxPerSec: 1,
    fillParent: true,
    autoplay: false,
    backend: 'WebAudio', // Use WebAudio for better peak rendering
    mediaControls: false,
  });

  // Immediately pause and mute wavesurfer when ready (visualization only)
  useEffect(() => {
    if (!wavesurfer || !isReady) return;

    setWaveformReady(true);
    onWaveformReady?.();

    // Mute and pause to prevent any audio playback
    wavesurfer.setMuted(true);
    wavesurfer.pause();

    // Get the audio element and disable it
    const audioElement = wavesurfer.getMediaElement();
    if (audioElement) {
      audioElement.muted = true;
      audioElement.pause();
      audioElement.onended = null;
      audioElement.onpause = null;
      audioElement.onplay = null;
    }
  }, [wavesurfer, isReady, onWaveformReady]);

  // Sync visual position with currentTime from the hook
  useEffect(() => {
    if (!wavesurfer || !isReady || !waveformReady) return;

    // Set the current time without triggering playback
    wavesurfer.setTime(currentTime);
  }, [currentTime, wavesurfer, isReady, waveformReady]);

  // Handle click-to-seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || duration <= 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const relativeX = x / rect.width;
      const seekTime = relativeX * duration;

      // Clamp to valid range
      const clampedTime = Math.max(0, Math.min(seekTime, duration));
      onSeek(clampedTime);
    },
    [duration, onSeek]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full h-12 cursor-pointer relative"
      style={{ minHeight: '48px' }}
    >
      {/* Loading state */}
      {(isLoading || !waveformReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/30 rounded">
          <div className="w-4/5 h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-pulse"
              style={{ backgroundColor: colors.wave }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
