import { useState, useEffect, useRef, useCallback } from 'react';
import type { Stem, StemPlayerState } from '@/types/stems';

export function useStemPlayer(stems: Stem[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mutedStems, setMutedStems] = useState<Set<string>>(new Set());
  const [soloStem, setSoloStem] = useState<string | null>(null);
  const [volume, setVolume] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, boolean>>({});

  // Map of stem ID to audio element
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio elements when stems change
  useEffect(() => {
    const audioMap = audioElementsRef.current;

    // Clean up old audio elements that are no longer in stems
    const currentStemIds = new Set(stems.map((s) => s.id));
    for (const [id, audio] of audioMap.entries()) {
      if (!currentStemIds.has(id)) {
        audio.pause();
        audio.src = '';
        audioMap.delete(id);
      }
    }

    // Initialize new audio elements
    const initialVolume: Record<string, number> = {};
    const initialLoadingProgress: Record<string, boolean> = {};
    let allLoaded = true;

    stems.forEach((stem) => {
      if (!audioMap.has(stem.id)) {
        const audio = new Audio();
        audio.src = stem.url;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';

        // Set initial volume
        initialVolume[stem.id] = 1.0;
        audio.volume = 1.0;

        // Track loading state
        initialLoadingProgress[stem.id] = false;
        allLoaded = false;

        audio.addEventListener('canplaythrough', () => {
          setLoadingProgress((prev) => ({ ...prev, [stem.id]: true }));
        });

        audio.addEventListener('loadedmetadata', () => {
          // Update duration to the longest stem
          if (audio.duration > 0) {
            setDuration((prev) => Math.max(prev, audio.duration));
          }
        });

        audioMap.set(stem.id, audio);
      } else {
        // Audio element already exists, check if it's loaded
        const audio = audioMap.get(stem.id)!;
        initialLoadingProgress[stem.id] = audio.readyState >= 3; // HAVE_FUTURE_DATA
        if (!initialLoadingProgress[stem.id]) {
          allLoaded = false;
        }
      }
    });

    setVolume((prev) => ({ ...prev, ...initialVolume }));
    setLoadingProgress((prev) => ({ ...prev, ...initialLoadingProgress }));
    setIsLoading(!allLoaded);

    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioMap.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioMap.clear();
    };
  }, [stems]);

  // Monitor loading progress
  useEffect(() => {
    const allLoaded = Object.values(loadingProgress).every((loaded) => loaded);
    setIsLoading(!allLoaded);
  }, [loadingProgress]);

  // Update current time periodically when playing
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateTime = () => {
      const audioMap = audioElementsRef.current;
      // Get current time from the first audio element (they should all be in sync)
      const firstAudio = audioMap.values().next().value as HTMLAudioElement | undefined;
      if (firstAudio) {
        setCurrentTime(firstAudio.currentTime);
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying]);

  // Apply mute/solo states to audio elements
  useEffect(() => {
    const audioMap = audioElementsRef.current;

    audioMap.forEach((audio, stemId) => {
      if (soloStem) {
        // If there's a solo stem, mute all others
        audio.muted = stemId !== soloStem;
      } else {
        // Otherwise, respect individual mute states
        audio.muted = mutedStems.has(stemId);
      }

      // Apply volume
      audio.volume = volume[stemId] ?? 1.0;
    });
  }, [mutedStems, soloStem, volume]);

  const play = useCallback(async () => {
    const audioMap = audioElementsRef.current;
    if (audioMap.size === 0) return;

    try {
      // Play all audio elements simultaneously
      await Promise.all(
        Array.from(audioMap.values()).map((audio) => audio.play())
      );
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing stems:', error);
    }
  }, []);

  const pause = useCallback(() => {
    const audioMap = audioElementsRef.current;
    audioMap.forEach((audio) => audio.pause());
    setIsPlaying(false);
  }, []);

  const seek = useCallback((time: number) => {
    const audioMap = audioElementsRef.current;
    audioMap.forEach((audio) => {
      audio.currentTime = time;
    });
    setCurrentTime(time);
  }, []);

  const toggleMute = useCallback((stemId: string) => {
    setMutedStems((prev) => {
      const newMuted = new Set(prev);
      if (newMuted.has(stemId)) {
        newMuted.delete(stemId);
      } else {
        newMuted.add(stemId);
      }
      return newMuted;
    });
  }, []);

  const toggleSolo = useCallback((stemId: string) => {
    setSoloStem((prev) => (prev === stemId ? null : stemId));
  }, []);

  const setStemVolume = useCallback((stemId: string, vol: number) => {
    setVolume((prev) => ({ ...prev, [stemId]: Math.max(0, Math.min(1, vol)) }));
  }, []);

  const muteAll = useCallback(() => {
    setMutedStems(new Set(stems.map((s) => s.id)));
  }, [stems]);

  const unmuteAll = useCallback(() => {
    setMutedStems(new Set());
    setSoloStem(null);
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    mutedStems,
    soloStem,
    volume,
    isLoading,
    loadingProgress,

    // Actions
    play,
    pause,
    seek,
    toggleMute,
    toggleSolo,
    setStemVolume,
    muteAll,
    unmuteAll,
  };
}
