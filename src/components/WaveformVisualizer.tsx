'use client';

import { useWavesurfer } from '@wavesurfer/react';
import { useEffect, useRef, useState } from 'react';
import { THEME } from '@/themes';
import { SongType } from '@/lib/interface';
import { db } from '@/lib/db';

type LoopMarkers = {
  start: number | null;
  end: number | null;
};

interface WaveformVisualizerProps {
  song: SongType;
  isPlaying: boolean;
  currentTime: number;
  onSeek?: (time: number) => void;
  onReady?: (duration: number) => void;
  loopMarkers?: LoopMarkers;
  isLoopEnabled?: boolean;
}

export const WaveformVisualizer = ({ 
  song, 
  isPlaying, 
  currentTime,
  onSeek,
  onReady,
  loopMarkers = { start: null, end: null },
  isLoopEnabled = false
}: WaveformVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: audioUrl || undefined,
    waveColor: '#ef4444', // red-500
    progressColor: '#dc2626', // red-600
    cursorColor: '#fbbf24', // amber-400
    barWidth: 2,
    barRadius: 2,
    barGap: 1,
    height: 80,
    normalize: true,
    interact: false, // Disable all interactions
    hideScrollbar: true,
    autoCenter: false,
    autoScroll: false,
    minPxPerSec: 1, // Make waveform fit the container width
    peaks: undefined, // We could pre-compute these server-side later
    autoplay: false, // Ensure autoplay is disabled
    backend: 'WebAudio', // Use WebAudio backend
  });

  // Load audio URL from cache only (it should already be cached by the main player)
  useEffect(() => {
    const loadAudio = async () => {
      if (!song.audio) return;
      
      setIsLoading(true);
      try {
        // Only load from cache, don't fetch again
        const cachedFile = await db.audioFiles.get(song._id);
        if (cachedFile && cachedFile.version === song.version) {
          const url = URL.createObjectURL(cachedFile.blob);
          setAudioUrl(url);
        } else {
          console.warn('Audio not in cache for waveform, skipping visualization');
        }
      } catch (error) {
        console.error('Error loading audio for waveform:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [song]);

  // Immediately pause and mute wavesurfer when ready
  useEffect(() => {
    if (!wavesurfer || !isReady) return;
    
    // Mute and pause to prevent any audio playback
    wavesurfer.setMuted(true);
    wavesurfer.pause();
    
    // Prevent finish event from firing
    const preventFinish = () => {
      // Simply do nothing when finish event fires
      return;
    };
    
    // Override the finish event to prevent it from propagating
    wavesurfer.on('finish', preventFinish);
    
    // Get the audio element and disable it
    const audioElement = wavesurfer.getMediaElement();
    if (audioElement) {
      audioElement.muted = true;
      audioElement.pause();
      // Remove all event listeners from the audio element
      audioElement.onended = null;
      audioElement.onpause = null;
      audioElement.onplay = null;
    }
    
    return () => {
      wavesurfer.un('finish', preventFinish);
    };
  }, [wavesurfer, isReady]);

  // Update current time
  useEffect(() => {
    if (!wavesurfer || !isReady) return;
    
    // Set the current time without triggering playback
    wavesurfer.setTime(currentTime);
  }, [currentTime, wavesurfer, isReady]);

  // Handle seeking via manual click on container
  useEffect(() => {
    if (!wavesurfer || !isReady || !containerRef.current) return;

    const container = containerRef.current;
    
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const relativeX = x / rect.width;
      const duration = wavesurfer.getDuration();
      const time = relativeX * duration;
      onSeek?.(time);
    };

    container.addEventListener('click', handleClick);
    container.style.cursor = 'pointer';

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [wavesurfer, isReady, onSeek]);

  // Handle ready event
  useEffect(() => {
    if (!wavesurfer || !isReady) return;

    const duration = wavesurfer.getDuration();
    onReady?.(duration);
  }, [wavesurfer, isReady, onReady]);

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded">
          <div className="text-sm text-zinc-400">Loading waveform...</div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`w-full ${isLoading ? 'opacity-50' : ''}`}
        style={{ minHeight: '80px' }}
      />
      
      {/* Loop markers overlay */}
      {wavesurfer && isReady && (
        <>
          {/* Loop region background */}
          {loopMarkers.start !== null && loopMarkers.end !== null && (
            <div 
              className={`absolute top-0 bottom-0 ${isLoopEnabled ? 'bg-amber-500/20' : 'bg-zinc-500/20'} border-l-2 border-r-2 ${isLoopEnabled ? 'border-amber-500' : 'border-zinc-500'} pointer-events-none`}
              style={{
                left: `${(loopMarkers.start / wavesurfer.getDuration()) * 100}%`,
                right: `${100 - (loopMarkers.end / wavesurfer.getDuration()) * 100}%`,
              }}
            />
          )}
          
          {/* A marker */}
          {loopMarkers.start !== null && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-green-500 pointer-events-none"
              style={{ left: `${(loopMarkers.start / wavesurfer.getDuration()) * 100}%` }}
            >
              <div className="absolute -top-1 -left-2 bg-green-500 text-white text-xs px-1 rounded">A</div>
            </div>
          )}
          
          {/* B marker */}
          {loopMarkers.end !== null && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none"
              style={{ left: `${(loopMarkers.end / wavesurfer.getDuration()) * 100}%` }}
            >
              <div className="absolute -top-1 -left-2 bg-blue-500 text-white text-xs px-1 rounded">B</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};