'use client';

import { useWavesurfer } from '@wavesurfer/react';
import { useEffect, useRef, useState, useCallback } from 'react';
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
  setLoopMarkers?: (markers: LoopMarkers) => void;
  isLoopEnabled?: boolean;
}

export const WaveformVisualizer = ({ 
  song, 
  isPlaying, 
  currentTime,
  onSeek,
  onReady,
  loopMarkers = { start: null, end: null },
  setLoopMarkers,
  isLoopEnabled = false
}: WaveformVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [waveformReady, setWaveformReady] = useState(false);
  
  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: audioUrl || undefined,
    waveColor: '#ef4444', // red-500
    progressColor: '#dc2626', // red-600
    cursorColor: '#fbbf24', // amber-400
    barWidth: 1,
    barRadius: 0,
    barGap: 0, // Reduce visual complexity for better performance
    height: 80,
    normalize: false, // Disable normalization for faster rendering
    interact: false, // Disable all interactions
    hideScrollbar: true,
    autoCenter: false,
    autoScroll: false,
    minPxPerSec: 1, // Fit waveform to container width
    peaks: undefined, // We could pre-compute these server-side later
    fillParent: true, // Fill the parent container
    autoplay: false, // Ensure autoplay is disabled
    backend: 'MediaElement', // Use MediaElement for faster loading
    mediaControls: false // Disable native controls
  });

  // Load audio URL from cache only (it should already be cached by the main player)
  useEffect(() => {
    const loadAudio = async () => {
      if (!song.audio) return;
      
      setIsLoading(true);
      setWaveformReady(false); // Reset waveform ready state
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
    
    // Mark waveform as ready
    setWaveformReady(true);
    
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

  // Handle mouse events for dragging markers
  const handleMouseDown = useCallback((e: React.MouseEvent, markerType: 'start' | 'end') => {
    if (!setLoopMarkers) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(markerType);
  }, [setLoopMarkers]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !wavesurfer || !isReady || !setLoopMarkers) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = x / rect.width;
    const duration = wavesurfer.getDuration();
    const time = relativeX * duration;
    
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, duration));
    
    if (isDragging === 'start') {
      setLoopMarkers({ ...loopMarkers, start: clampedTime });
    } else if (isDragging === 'end') {
      setLoopMarkers({ ...loopMarkers, end: clampedTime });
    }
  }, [isDragging, wavesurfer, isReady, setLoopMarkers, loopMarkers]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle seeking via manual click on container (but not when dragging)
  useEffect(() => {
    if (!wavesurfer || !isReady || !containerRef.current) return;

    const container = containerRef.current;
    
    const handleClick = (e: MouseEvent) => {
      // Don't seek if we're dragging a marker
      if (isDragging) return;
      
      // Check if click is on a marker (within 10px of marker position)
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const relativeX = x / rect.width;
      const duration = wavesurfer.getDuration();
      const clickTime = relativeX * duration;
      
      // Don't seek if clicking near markers
      if (loopMarkers.start !== null && Math.abs(clickTime - loopMarkers.start) < duration * 0.02) return;
      if (loopMarkers.end !== null && Math.abs(clickTime - loopMarkers.end) < duration * 0.02) return;
      
      onSeek?.(clickTime);
    };

    container.addEventListener('click', handleClick);
    container.style.cursor = 'pointer';

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [wavesurfer, isReady, onSeek, isDragging, loopMarkers]);

  // Handle ready event
  useEffect(() => {
    if (!wavesurfer || !isReady) return;

    const duration = wavesurfer.getDuration();
    onReady?.(duration);
  }, [wavesurfer, isReady, onReady]);

  return (
    <div className="relative w-full">
      {/* Show a simple loading bar while waveform is loading */}
      {(isLoading || !waveformReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded">
          <div className="w-full h-20 bg-zinc-800 rounded flex items-center justify-center">
            <div className="w-4/5 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`w-full ${(isLoading || !waveformReady) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
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
              className={`absolute top-0 bottom-0 ${setLoopMarkers ? 'cursor-ew-resize' : 'pointer-events-none'}`}
              style={{ 
                left: `${(loopMarkers.start / wavesurfer.getDuration()) * 100}%`,
                width: '20px',
                marginLeft: '-10px'
              }}
              onMouseDown={setLoopMarkers ? (e) => handleMouseDown(e, 'start') : undefined}
            >
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-green-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">A</div>
              {setLoopMarkers && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
              )}
            </div>
          )}
          
          {/* B marker */}
          {loopMarkers.end !== null && (
            <div 
              className={`absolute top-0 bottom-0 ${setLoopMarkers ? 'cursor-ew-resize' : 'pointer-events-none'}`}
              style={{ 
                left: `${(loopMarkers.end / wavesurfer.getDuration()) * 100}%`,
                width: '20px',
                marginLeft: '-10px'
              }}
              onMouseDown={setLoopMarkers ? (e) => handleMouseDown(e, 'end') : undefined}
            >
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-blue-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">B</div>
              {setLoopMarkers && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};