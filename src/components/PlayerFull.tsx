'use client';

import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Mic, Repeat, RotateCcw } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { WaveformVisualizer } from './WaveformVisualizer';

interface PlayerFullProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerFull = ({ isOpen, onClose }: PlayerFullProps) => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const loopMarkers = usePlayerStore((state) => state.loopMarkers);
  const setLoopMarkers = usePlayerStore((state) => state.setLoopMarkers);
  const isLoopEnabled = usePlayerStore((state) => state.isLoopEnabled);
  const setIsLoopEnabled = usePlayerStore((state) => state.setIsLoopEnabled);
  const { previousTrack, nextTrack, playPauseTrack, paused, duration, isLoading, seekTrack, isChangingSong } = usePlaylistPlayer();
  
  const time = useAudioTime();

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    return new Date(seconds * 1000).toISOString().slice(15, 19);
  };

  // Loop marker functions
  const setMarkerA = useCallback(() => {
    setLoopMarkers({ ...loopMarkers, start: time });
  }, [loopMarkers, time, setLoopMarkers]);

  const setMarkerB = useCallback(() => {
    setLoopMarkers({ ...loopMarkers, end: time });
  }, [loopMarkers, time, setLoopMarkers]);

  const clearMarkers = useCallback(() => {
    setLoopMarkers({ start: null, end: null });
    setIsLoopEnabled(false);
  }, [setLoopMarkers, setIsLoopEnabled]);

  const toggleLoop = useCallback(() => {
    if (loopMarkers.start !== null && loopMarkers.end !== null) {
      setIsLoopEnabled(!isLoopEnabled);
    }
  }, [loopMarkers, isLoopEnabled, setIsLoopEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          playPauseTrack();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousTrack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextTrack();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          setMarkerA();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          setMarkerB();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          toggleLoop();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          clearMarkers();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, playPauseTrack, previousTrack, nextTrack, onClose, setMarkerA, setMarkerB, toggleLoop, clearMarkers]);

  if (!selectedSong) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute top-20 left-4 right-4 bottom-4 md:top-24 md:left-8 md:right-8 md:bottom-8 lg:top-28 lg:left-16 lg:right-16 lg:bottom-16 bg-zinc-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
              <h2 className="text-lg font-semibold">Now Playing</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${THEME.highlight} hover:bg-zinc-700 transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main content */}
            <div className="h-full flex flex-col items-center justify-center p-6 pb-24">
              {/* Album art */}
              <div className="relative mb-6">
                <div className={`w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 relative ${isChangingSong ? 'opacity-50' : ''}`}>
                  {/* Vinyl effect */}
                  <div 
                    className={`absolute -inset-2 ${!paused && !isChangingSong ? 'animate-spin' : ''} rounded-full bg-gradient-to-br from-amber-500 to-red-800`} 
                    style={{ animationDuration: '5s' }}
                  />
                  <div className="absolute left-1/2 top-1/2 z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-zinc-700 bg-zinc-900" />
                  <img 
                    src={selectedSong.artwork} 
                    alt={selectedSong.title} 
                    className={`relative z-10 w-full h-full ${!paused && !isChangingSong ? 'animate-spin' : ''} rounded-full border-4 border-zinc-800 shadow-2xl`} 
                    style={{ animationDuration: '15s' }} 
                  />
                </div>
                {isChangingSong && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 border-4 border-zinc-700 border-t-red-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Song info */}
              <div className="text-center mb-6 max-w-md">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedSong.title}</h1>
                <p className="text-lg md:text-xl text-zinc-400 mb-3">{selectedSong.artist}</p>
                
                {/* Metadata badges */}
                <div className="flex items-center justify-center gap-3">
                  {selectedSong.dualGuitar && (
                    <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full px-3 py-1.5`}>
                      <TbGuitarPickFilled className={`h-5 w-5 ${THEME.primary}`} />
                    </div>
                  )}
                  {selectedSong.dualVocal && (
                    <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full px-3 py-1.5`}>
                      <Mic className={`h-5 w-5 ${THEME.secondary}`} />
                    </div>
                  )}
                  {(selectedSong as any).tempo_bpm && (
                    <span className={`${THEME.textSecondary} ${THEME.highlight} rounded-full px-3 py-1.5 text-sm`}>
                      {(selectedSong as any).tempo_bpm} BPM
                    </span>
                  )}
                  {(selectedSong as any).key_signature && (
                    <span className={`${THEME.textSecondary} ${THEME.highlight} rounded-full px-3 py-1.5 text-sm`}>
                      Key: {(selectedSong as any).key_signature}
                    </span>
                  )}
                </div>
              </div>

              {/* Waveform visualizer */}
              <div className="w-full max-w-4xl mb-6">
                <div className="mb-2">
                  <WaveformVisualizer 
                    song={selectedSong}
                    isPlaying={!paused && !isChangingSong}
                    currentTime={time}
                    onSeek={seekTrack}
                    loopMarkers={loopMarkers}
                    isLoopEnabled={isLoopEnabled}
                  />
                </div>
                <div className="flex items-center justify-between text-sm tabular-nums text-zinc-400">
                  <span>{formatTime(time)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-6 mb-4">
                <button 
                  className={`p-3 ${THEME.text} hover:${THEME.primary} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={previousTrack}
                  disabled={isChangingSong}
                >
                  <SkipBack className="h-8 w-8" />
                </button>
                
                <button 
                  className={`${THEME.primaryBg} rounded-full p-5 text-white shadow-lg shadow-red-900/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={playPauseTrack}
                  disabled={isLoading || isChangingSong}
                >
                  {(isLoading || isChangingSong) ? (
                    <div className="h-8 w-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : paused ? (
                    <Play className="h-8 w-8 ml-1" />
                  ) : (
                    <Pause className="h-8 w-8" />
                  )}
                </button>
                
                <button 
                  className={`p-3 ${THEME.text} hover:${THEME.primary} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={nextTrack}
                  disabled={isChangingSong}
                >
                  <SkipForward className="h-8 w-8" />
                </button>
              </div>

              {/* Loop controls */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      loopMarkers.start !== null 
                        ? `${THEME.primaryBg} text-white` 
                        : `${THEME.highlight} ${THEME.text} hover:bg-zinc-700`
                    }`}
                    onClick={setMarkerA}
                    title="Set A marker (A key)"
                  >
                    A: {loopMarkers.start !== null ? formatTime(loopMarkers.start) : '--:--'}
                  </button>
                  
                  <button 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      loopMarkers.end !== null 
                        ? `${THEME.primaryBg} text-white` 
                        : `${THEME.highlight} ${THEME.text} hover:bg-zinc-700`
                    }`}
                    onClick={setMarkerB}
                    title="Set B marker (B key)"
                  >
                    B: {loopMarkers.end !== null ? formatTime(loopMarkers.end) : '--:--'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    className={`p-2 rounded-md transition-colors ${
                      isLoopEnabled 
                        ? `${THEME.primaryBg} text-white shadow-lg` 
                        : `${THEME.highlight} ${THEME.text} hover:bg-zinc-700`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={toggleLoop}
                    disabled={loopMarkers.start === null || loopMarkers.end === null}
                    title={`${isLoopEnabled ? 'Disable' : 'Enable'} loop (L key)`}
                  >
                    <Repeat className="h-5 w-5" />
                  </button>
                  
                  <button 
                    className={`p-2 rounded-md ${THEME.highlight} ${THEME.text} hover:bg-zinc-700 transition-colors`}
                    onClick={clearMarkers}
                    title="Clear markers (C key)"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};