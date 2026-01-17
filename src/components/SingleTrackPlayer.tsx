'use client';

import { Play, Pause, Loader2 } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useWavesurfer } from '@wavesurfer/react';
import { usePlayerStore } from '@/store/store';
import { usePlaylistPlayer, useAudioTime } from '@/hooks/useAudioTime';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { db } from '@/lib/db';
import { THEME } from '@/themes';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SingleTrackPlayer() {
  const { currentSong } = usePlayerStore();
  const { playPauseTrack, seekTrack } = usePlaylistPlayer();
  const { paused, duration, isLoading: isAudioLoading } = useGlobalAudioPlayer();
  const currentTime = useAudioTime();

  const containerRef = useRef<HTMLDivElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveformReady, setWaveformReady] = useState(false);

  // Load audio URL from cache for waveform visualization
  useEffect(() => {
    const loadAudio = async () => {
      if (!currentSong?.audio) return;

      setWaveformReady(false);
      try {
        const cachedFile = await db.audioFiles.get(currentSong._id);
        if (cachedFile && cachedFile.version === (currentSong.version || 0)) {
          const url = URL.createObjectURL(cachedFile.blob);
          setAudioUrl(url);
        } else {
          // If not cached, use the direct URL (waveform will load slower)
          setAudioUrl(currentSong.audio);
        }
      } catch (error) {
        console.error('Error loading audio for waveform:', error);
        setAudioUrl(currentSong.audio);
      }
    };

    loadAudio();
  }, [currentSong?._id, currentSong?.audio, currentSong?.version]);

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: audioUrl || undefined,
    waveColor: '#ef4444', // red-500
    progressColor: '#dc2626', // red-600
    cursorColor: 'transparent',
    cursorWidth: 0,
    barWidth: 2,
    barRadius: 1,
    barGap: 1,
    height: 120,
    normalize: true,
    interact: false,
    hideScrollbar: true,
    autoCenter: false,
    autoScroll: false,
    minPxPerSec: 1,
    fillParent: true,
    autoplay: false,
    backend: 'WebAudio',
    mediaControls: false,
  });

  // Mute and pause wavesurfer (visualization only)
  useEffect(() => {
    if (!wavesurfer || !isReady) return;

    setWaveformReady(true);
    wavesurfer.setMuted(true);
    wavesurfer.pause();

    const audioElement = wavesurfer.getMediaElement();
    if (audioElement) {
      audioElement.muted = true;
      audioElement.pause();
    }
  }, [wavesurfer, isReady]);

  // Sync waveform position with actual playback
  useEffect(() => {
    if (!wavesurfer || !isReady || !waveformReady) return;
    wavesurfer.setTime(currentTime);
  }, [currentTime, wavesurfer, isReady, waveformReady]);

  // Handle click-to-seek on waveform
  const handleWaveformClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || duration <= 0) return;

      const rect = containerRef.current.getBoundingClientRect();
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

  const isLoading = isAudioLoading || !waveformReady;

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
            disabled={isAudioLoading}
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

      {/* Waveform */}
      <div className="relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              <span className={`text-sm ${THEME.textSecondary}`}>
                Loading waveform...
              </span>
            </div>
          </div>
        )}

        {/* Unified Playhead */}
        {duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        )}

        <div
          ref={containerRef}
          onClick={handleWaveformClick}
          className="w-full cursor-pointer"
          style={{ minHeight: '120px' }}
        />
      </div>
    </div>
  );
}
