'use client';

import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { Pause, Play, SkipBack, SkipForward, Volume2, Maximize2, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const PlayerMini = () => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const { previousTrack, nextTrack, playPauseTrack, paused, duration, isLoading, seekTrack, isChangingSong } = usePlaylistPlayer();

  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0 && !isSeeking) {
      setProgress((time / duration) * 100);
    }
  }, [time, duration, isSeeking]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const seekTime = (percentage / 100) * duration;
    
    setProgress(percentage);
    seekTrack(seekTime);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    return new Date(seconds * 1000).toISOString().slice(15, 19);
  };

  if (!selectedSong) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className={`fixed bottom-16 left-0 right-0 ${THEME.card} border-t backdrop-blur-xl ${THEME.border} z-40 shadow-lg`}
      >
        <div className={`transition-all duration-300 ${isExpanded ? 'p-4 pb-2' : 'p-2.5 pb-1'}`}>
          {/* Main player content */}
          <div className="flex items-center gap-3">
            {/* Album art with vinyl animation or loading indicator */}
            <div className={`relative transition-all duration-300 ${isExpanded ? 'w-16 h-16' : 'w-12 h-12'}`}>
              {isChangingSong ? (
                /* Loading state */
                <div className={`w-full h-full rounded-full ${THEME.highlight} border-2 border-zinc-700 flex items-center justify-center`}>
                  <Loader2 className={`${isExpanded ? 'h-6 w-6' : 'h-4 w-4'} animate-spin ${THEME.primary}`} />
                </div>
              ) : (
                /* Normal album art */
                <>
                  <div 
                    className={`absolute -inset-[1px] ${!paused ? 'animate-spin' : ''} rounded-full bg-gradient-to-br from-amber-500 to-red-800`} 
                    style={{ animationDuration: '5s' }}
                  />
                  <div className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900" />
                  <img 
                    src={selectedSong.artwork} 
                    alt="Now Playing" 
                    className={`relative z-10 w-full h-full ${!paused ? 'animate-spin' : ''} rounded-full border-2 border-zinc-800`} 
                    style={{ animationDuration: '15s' }} 
                  />
                  <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900" />
                </>
              )}
            </div>

            {/* Song info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className={`truncate font-medium ${isExpanded ? 'text-base' : 'text-sm'}`}>
                    {selectedSong.title}
                  </h3>
                  <p className={`truncate ${THEME.textSecondary} ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                    {selectedSong.artist}
                  </p>
                </div>
                
                {/* Expand/collapse button for mobile */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-1.5 rounded-full ${THEME.highlight} lg:hidden`}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <Maximize2 className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Additional info when expanded */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 text-xs mt-2"
                >
                  {selectedSong.dualGuitar && (
                    <span className={`${THEME.secondary}`}>🎸 Dual Guitar</span>
                  )}
                  {selectedSong.dualVocal && (
                    <span className={`${THEME.secondary}`}>🎤 Dual Vocal</span>
                  )}
                  {(selectedSong as any).tempo_bpm && (
                    <span className={`${THEME.textSecondary}`}>
                      {(selectedSong as any).tempo_bpm} BPM
                    </span>
                  )}
                  {(selectedSong as any).key_signature && (
                    <span className={`${THEME.textSecondary}`}>
                      Key: {(selectedSong as any).key_signature}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Playback controls */}
            <div className={`flex items-center ${isExpanded ? 'gap-3' : 'gap-2'} ml-2`}>
              <button 
                className={`p-1.5 ${THEME.text} hover:${THEME.primary} transition-colors`} 
                onClick={previousTrack}
                title="Previous"
              >
                <SkipBack className={`${isExpanded ? 'h-5 w-5' : 'h-4 w-4'}`} />
              </button>
              
              <button 
                className={`${THEME.primaryBg} rounded-full ${isExpanded ? 'p-2.5' : 'p-2'} text-white shadow-lg shadow-red-900/30 hover:scale-105 transition-transform`} 
                onClick={playPauseTrack}
                disabled={isLoading}
                title={paused ? 'Play' : 'Pause'}
              >
                {isLoading ? (
                  <div className={`${isExpanded ? 'h-5 w-5' : 'h-4 w-4'} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
                ) : paused ? (
                  <Play className={`${isExpanded ? 'h-5 w-5' : 'h-4 w-4'} ml-0.5`} />
                ) : (
                  <Pause className={`${isExpanded ? 'h-5 w-5' : 'h-4 w-4'}`} />
                )}
              </button>
              
              <button 
                className={`p-1.5 ${THEME.text} hover:${THEME.primary} transition-colors`} 
                onClick={nextTrack}
                title="Next"
              >
                <SkipForward className={`${isExpanded ? 'h-5 w-5' : 'h-4 w-4'}`} />
              </button>
            </div>
          </div>

          {/* Full-width progress bar below */}
          <div className={`mt-3 -mx-2.5 ${isExpanded ? '-mx-4' : ''}`}>
            {/* Time and progress bar */}
            <div className="flex items-center gap-2 px-2.5">
              <span className={`${THEME.textSecondary} ${isExpanded ? 'text-sm' : 'text-xs'} tabular-nums`}>
                {formatTime(time)}
              </span>
              
              {/* Seekable progress bar */}
              <div 
                ref={progressBarRef}
                className={`flex-1 relative ${isExpanded ? 'h-2' : 'h-1.5'} bg-zinc-800 rounded-full cursor-pointer group`}
                onClick={handleSeek}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onMouseLeave={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
                onTouchMove={handleSeek}
              >
                {/* Progress fill */}
                <div 
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-amber-500 pointer-events-none"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Seek handle */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity ${
                    isSeeking || isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              
              <span className={`${THEME.textSecondary} ${isExpanded ? 'text-sm' : 'text-xs'} tabular-nums`}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};