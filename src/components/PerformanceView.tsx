'use client';

import { usePlayerStore } from '@/store/store';
import { getLyrics } from '@/actions/supabase';
import { LyricType } from '@/lib/interface';
import { ChevronLeft, ChevronRight, X, RotateCcw, ZoomIn, ZoomOut, Loader2, Sun, Moon, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChordSheetViewer } from './ChordSheetViewer';

export default function PerformanceView() {
  const {
    performancePlaylist,
    currentPerformanceIndex,
    setCurrentPerformanceIndex,
    isPerformanceMode,
    setIsPerformanceMode,
    isDarkMode,
    setIsDarkMode
  } = usePlayerStore();

  const defaultTextSize = 8;
  const [textSize, setTextSize] = useState(defaultTextSize); // Larger default for performance
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState<LyricType | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isVisualClickEnabled, setIsVisualClickEnabled] = useState(false);
  const [isAudibleClickEnabled, setIsAudibleClickEnabled] = useState(false);
  const [metronomeInterval, setMetronomeInterval] = useState<NodeJS.Timeout | null>(null);
  const [visualPulse, setVisualPulse] = useState(false);

  const minTextSize = 4;
  const maxTextSize = 40;

  // Get current song
  const currentSong = performancePlaylist[currentPerformanceIndex];

  // Get tempo from song data, default to 120 BPM if not available
  const songTempo = (currentSong as any)?.tempo_bpm || 120;

  // Create audio context for metronome clicks
  const createClick = useCallback(() => {
    if (typeof window !== 'undefined' && isAudibleClickEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // High pitch click
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, [isAudibleClickEnabled]);

  // Metronome tick function
  const tick = useCallback(() => {
    if (isVisualClickEnabled) {
      setVisualPulse(true);
      setTimeout(() => setVisualPulse(false), 100);
    }
    if (isAudibleClickEnabled) {
      createClick();
    }
  }, [isVisualClickEnabled, isAudibleClickEnabled, createClick]);

  // Navigation state
  const hasPrevious = currentPerformanceIndex > 0;
  const hasNext = currentPerformanceIndex < performancePlaylist.length - 1;
  const totalSongs = performancePlaylist.length;

  // Navigation functions
  const navigateToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentLyrics(null);
      setCurrentPerformanceIndex(currentPerformanceIndex - 1);
    }
  }, [hasPrevious, currentPerformanceIndex, setCurrentPerformanceIndex]);

  const navigateToNext = useCallback(() => {
    if (hasNext) {
      setCurrentLyrics(null);
      setCurrentPerformanceIndex(currentPerformanceIndex + 1);
    }
  }, [hasNext, currentPerformanceIndex, setCurrentPerformanceIndex]);

  const adjustTextSize = (delta: number) => {
    setTextSize((prev) => Math.max(minTextSize, Math.min(maxTextSize, prev + delta)));
  };

  // Fetch lyrics for current song
  const fetchLyrics = useCallback(async (songId: string) => {
    if (!songId) return;

    setIsLoadingLyrics(true);
    try {
      const lyrics = await getLyrics(songId);
      setCurrentLyrics(lyrics);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setCurrentLyrics(null);
    } finally {
      setIsLoadingLyrics(false);
    }
  }, []);

  // Metronome management effect
  useEffect(() => {
    if (isVisualClickEnabled || isAudibleClickEnabled) {
      const interval = 60000 / songTempo; // Convert BPM to milliseconds
      const intervalId = setInterval(tick, interval);
      setMetronomeInterval(intervalId);
      
      return () => {
        clearInterval(intervalId);
        setMetronomeInterval(null);
      };
    } else {
      if (metronomeInterval) {
        clearInterval(metronomeInterval);
        setMetronomeInterval(null);
      }
    }
  }, [isVisualClickEnabled, isAudibleClickEnabled, songTempo, tick]);

  // Cleanup metronome on unmount
  useEffect(() => {
    return () => {
      if (metronomeInterval) {
        clearInterval(metronomeInterval);
      }
    };
  }, [metronomeInterval]);

  // Fetch lyrics when current song changes
  useEffect(() => {
    if (currentSong?._id) {
      fetchLyrics(currentSong._id);
    }
  }, [currentSong?._id, fetchLyrics]);

  // Fullscreen management
  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  }, []);

  // Exit performance mode
  const exitPerformanceMode = useCallback(() => {
    setIsPerformanceMode(false);
    if (isFullscreen) {
      exitFullscreen();
    }
  }, [setIsPerformanceMode, isFullscreen, exitFullscreen]);

  // Note: Fullscreen can only be triggered by user interaction
  // We don't auto-enter fullscreen to avoid browser errors

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exitPerformanceMode();
      }

      if (e.key === 'ArrowLeft' && hasPrevious) {
        e.preventDefault();
        navigateToPrevious();
      }
      if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        navigateToNext();
      }

      if (e.key === ' ' && hasNext) {
        e.preventDefault();
        navigateToNext();
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        adjustTextSize(2);
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        adjustTextSize(-2);
      }
      if (e.key === '0') {
        e.preventDefault();
        setTextSize(defaultTextSize);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitPerformanceMode, hasPrevious, hasNext, navigateToPrevious, navigateToNext]);

  // Don't render if not in performance mode
  if (!isPerformanceMode || !currentSong) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-zinc-950' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-900'} overflow-hidden`}>
      {/* Progress Bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-800">
        <div
          className="h-full bg-red-600 transition-all duration-300"
          style={{
            width: `${((currentPerformanceIndex + 1) / totalSongs) * 100}%`
          }}
        />
      </div>

      {/* Fixed Fullscreen Controls */}
      <>
        {/* Song title at top for desktop */}
        <div className={`${isDarkMode ? '' : 'bg-white'} hidden transform text-center md:block fixed top-2 left-0 right-0 z-40 py-4`}>
          <h1 className={`text-2xl font-bold drop-shadow-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentSong?.title || 'Performance Mode'}
          </h1>
          <p className={`text-lg drop-shadow-md ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
            {currentSong?.artist || ''}
          </p>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={exitPerformanceMode}
          className="fixed right-4 top-4 z-50 h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white hover:bg-black/70"
          title="Exit performance mode (Esc)"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Theme toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed right-20 top-4 z-50 h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white hover:bg-black/70"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Progress indicator in top-left */}
        <div className="fixed left-4 top-4 z-50 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm">
          <div>Song {currentPerformanceIndex + 1} of {totalSongs}</div>
          <div className="text-xs text-white/70">
            {Math.round(((currentPerformanceIndex + 1) / totalSongs) * 100)}% complete
          </div>
          <div className="text-xs text-white/70 mt-1 border-t border-white/20 pt-1">
            {songTempo} BPM
          </div>
        </div>

        {/* Click toggles */}
        <div className="fixed right-4 top-[50%] z-50 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisualClickEnabled(!isVisualClickEnabled)}
              className={`h-12 w-12 rounded-full border border-white/20 text-white hover:bg-black ${
                isVisualClickEnabled ? 'bg-rose-600/80' : 'bg-black'
              }`}
              title={isVisualClickEnabled ? 'Disable visual click' : 'Enable visual click'}
            >
              {isVisualClickEnabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </Button>
          </div>

        {/* Visual pulse indicator */}
        {isVisualClickEnabled && (
          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  z-40 h-20 w-20 bg-rose-600 rounded-full  transition-all duration-75 ${
            visualPulse ? 'scale-[2]  ' : 'scale-100  '
          }`} />
        )}

        {/* Navigation buttons for performance - positioned on the right */}
        {totalSongs > 1 && (
          <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4" style={{ transform: 'translateY(-50%)' }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateToPrevious}
              disabled={!hasPrevious}
              className={`h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white transition-opacity hover:bg-black/70 ${!hasPrevious ? 'cursor-not-allowed opacity-30' : ''}`}
              title="Previous song (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateToNext}
              disabled={!hasNext}
              className={`h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white transition-opacity hover:bg-black/70 ${!hasNext ? 'cursor-not-allowed opacity-30' : ''}`}
              title="Next song (→ or Space)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Zoom controls vertically under theme button on tablets/desktop */}
        <div className="fixed right-4 top-36 z-50 hidden md:block">
          <div className="flex flex-col rounded-xl border border-white/20 bg-black/50 p-1 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => adjustTextSize(2)}
              disabled={textSize >= maxTextSize}
              title="Increase text size (+)"
              className="h-10 w-10 rounded-lg text-white transition-colors hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTextSize(defaultTextSize)}
              disabled={textSize === defaultTextSize}
              title="Reset text size (0)"
              className="h-10 w-10 rounded-lg text-white transition-colors hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => adjustTextSize(-2)}
              disabled={textSize <= minTextSize}
              title="Decrease text size (-)"
              className="h-10 w-10 rounded-lg text-white transition-colors hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
          <span className="mt-2 block text-center text-xs text-white/70">{Math.round((textSize / defaultTextSize) * 100)}%</span>
        </div>
      </>

      {/* Main content */}
      <div className={`flex h-full flex-col justify-start overflow-y-auto p-8 pt-24 md:pt-20`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSong._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col"
          >
            {/* Song title at top for mobile */}
            <div className="mb-8 text-center md:hidden">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentSong.title}
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                {currentSong.artist}
              </p>
            </div>

            {/* Mobile font controls */}
            <div className="mb-8 flex items-center justify-center gap-4 md:hidden">
              <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-black/30 p-1 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => adjustTextSize(-2)}
                  disabled={textSize <= minTextSize}
                  title="Decrease text size (-)"
                  className="rounded-md text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTextSize(defaultTextSize)}
                  disabled={textSize === defaultTextSize}
                  title="Reset text size (0)"
                  className="rounded-md text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => adjustTextSize(2)}
                  disabled={textSize >= maxTextSize}
                  title="Increase text size (+)"
                  className="rounded-md text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <span className="ml-2 w-12 text-center text-sm text-white">{Math.round((textSize / defaultTextSize) * 100)}%</span>
              </div>
            </div>

            {/* Lyrics content */}
            <div
              className={`w-full max-w-none flex-1 text-center leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'} min-h-[60vh] flex items-center justify-center`}
              style={{ lineHeight: '1.6' }}
            >
              {isLoadingLyrics ? (
                <div className={`flex flex-col items-center gap-4 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Loading lyrics...</p>
                </div>
              ) : currentLyrics?.lyrics ? (
                <div className="w-full text-center">
                  <ChordSheetViewer
                    lyrics={currentLyrics.lyrics}
                    className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: `${textSize + 8}px` }}
                  />
                </div>
              ) : (
                <div className={`text-center ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  <p className="mb-8">No lyrics available for this song.</p>
                  <div className="text-sm space-y-2">
                    <p>Use ← → arrow keys or the side buttons to navigate between songs.</p>
                    <p>Press Esc to exit performance mode.</p>
                    <p>Use +/- keys to adjust text size.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
