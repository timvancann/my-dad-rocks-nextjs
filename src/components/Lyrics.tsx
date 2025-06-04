'use client';

import { modifyLyrics } from '@/actions/supabase';
import { LyricType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Edit2, Loader2, Maximize, Minimize, Moon, RotateCcw, Save, Sun, X, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function DisplayLyrics({ song, songId }: { song: LyricType; songId: string }) {
  const router = useRouter();
  const { isFullscreen, setIsFullscreen, playlist, currentSong, isDarkMode, setIsDarkMode } = usePlayerStore();
  const [edit, setEdit] = useState(false);
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [textSize, setTextSize] = useState(16); // Base font size in pixels
  const defaultTextSize = 16;
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const minTextSize = 12;
  const maxTextSize = 32;

  // Calculate current song index and navigation availability
  // Navigation only works when coming from a playlist context (clicking a song card)
  const currentSongIndex = playlist.findIndex((s) => s._id === songId);
  const hasPrevious = currentSongIndex > 0;
  const hasNext = currentSongIndex < playlist.length - 1;
  const hasPlaylist = playlist.length > 0;

  const navigateToPrevious = useCallback(() => {
    if (hasPrevious) {
      const previousSong = playlist[currentSongIndex - 1];
      router.push(`/practice/lyrics/${previousSong.slug}`);
    }
  }, [hasPrevious, currentSongIndex, playlist, router]);

  const navigateToNext = useCallback(() => {
    if (hasNext) {
      const nextSong = playlist[currentSongIndex + 1];
      router.push(`/practice/lyrics/${nextSong.slug}`);
    }
  }, [hasNext, currentSongIndex, playlist, router]);

  const handleSave = useCallback(async () => {
    if (lyrics === song.lyrics) {
      setEdit(false);
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      await modifyLyrics(songId, lyrics);
      setSaveStatus('success');
      setEdit(false);

      // Show success feedback
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      setSaveStatus('error');
      setError('Failed to save lyrics. Please try again.');
      console.error('Error saving lyrics:', err);
    } finally {
      setIsSaving(false);
    }
  }, [lyrics, song.lyrics, songId]);

  const handleCancel = useCallback(() => {
    setLyrics(song.lyrics);
    setEdit(false);
    setError(null);
    setSaveStatus('idle');
  }, [song.lyrics]);

  const adjustTextSize = (delta: number) => {
    setTextSize((prev) => Math.max(minTextSize, Math.min(maxTextSize, prev + delta)));
  };

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
  }, [setIsFullscreen]);

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
  }, [setIsFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
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
  }, [setIsFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && edit) {
        e.preventDefault();
        handleSave();
      }
      // Escape to cancel edit or exit fullscreen
      if (e.key === 'Escape') {
        e.preventDefault();
        if (edit) {
          handleCancel();
        } else if (isFullscreen) {
          exitFullscreen();
        }
      }
      // Ctrl/Cmd + E to toggle edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !edit) {
        e.preventDefault();
        setEdit(true);
      }
      // F11 to toggle fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      // Arrow keys for navigation in fullscreen
      if (isFullscreen && !edit) {
        if (e.key === 'ArrowLeft' && hasPrevious) {
          e.preventDefault();
          navigateToPrevious();
        }
        if (e.key === 'ArrowRight' && hasNext) {
          e.preventDefault();
          navigateToNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [edit, lyrics, handleSave, handleCancel, isFullscreen, exitFullscreen, toggleFullscreen, hasPrevious, hasNext, navigateToPrevious, navigateToNext]);

  return (
    <div className="min-h-screen">
      {/* Fullscreen controls for tablets and larger screens */}
      {isFullscreen && (
        <>
          {/* Song title at top */}
          <div className={`${isDarkMode ? '' : 'bg-white'} hidden transform text-center md:block`}>
            <h1 className={`text-2xl font-bold drop-shadow-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{song.title}</h1>
            <p className={`text-lg drop-shadow-md ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>{song.artist}</p>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={exitFullscreen}
            className="fixed right-4 top-4 z-50 h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white hover:bg-black/70"
            title="Exit fullscreen (Esc)"
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

          {/* Navigation buttons for setlist - positioned on the right */}
          {hasPlaylist && (
            <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4" style={{ transform: 'translateY(-50%)' }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={navigateToPrevious}
                disabled={!hasPrevious}
                className={`h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white transition-opacity hover:bg-black/70 ${!hasPrevious ? 'cursor-not-allowed opacity-30' : ''}`}
                title="Previous song in setlist"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={navigateToNext}
                disabled={!hasNext}
                className={`h-12 w-12 rounded-full border border-white/20 bg-black/50 text-white transition-opacity hover:bg-black/70 ${!hasNext ? 'cursor-not-allowed opacity-30' : ''}`}
                title="Next song in setlist"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Zoom controls vertically under close button on tablets/desktop */}
          <div className="fixed right-4 top-20 z-50 hidden md:block">
            <div className="flex flex-col rounded-xl border border-white/20 bg-black/50 p-1 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustTextSize(2)}
                disabled={textSize >= maxTextSize}
                title="Increase text size"
                className="h-10 w-10 rounded-lg text-white transition-colors hover:bg-white/20"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTextSize(defaultTextSize)}
                disabled={textSize === defaultTextSize}
                title="Reset text size"
                className="h-10 w-10 rounded-lg text-white transition-colors hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustTextSize(-2)}
                disabled={textSize <= minTextSize}
                title="Decrease text size"
                className="h-10 w-10 rounded-lg text-white transition-colors hover:bg-white/20"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
            </div>
            <span className="mt-2 block text-center text-xs text-white/70">{Math.round((textSize / 16) * 100)}%</span>
          </div>
        </>
      )}

      {/* Mobile-optimized header */}
      {!isFullscreen && (
        <div className={`sticky top-0 z-10 ${THEME.bg} border-b ${THEME.border} shadow-sm`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="mx-2 min-w-0 flex-1 text-center sm:mx-4">
                <h1 className={`text-base font-bold sm:text-xl ${THEME.text} truncate`}>{song.title}</h1>
                <p className={`text-xs sm:text-sm ${THEME.textSecondary} truncate`}>{song.artist}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Text size controls */}
                <div className="flex items-center gap-2 rounded-lg bg-zinc-800 p-1">
                  <Button variant="ghost" size="icon" onClick={() => adjustTextSize(-2)} disabled={textSize <= minTextSize} title="Decrease text size">
                    <ZoomOut />
                  </Button>
                  <span className={`hidden text-xs sm:inline ${THEME.textSecondary} w-12 text-center`}>{Math.round((textSize / 16) * 100)}%</span>
                  <Button variant="ghost" size="icon" onClick={() => adjustTextSize(2)} disabled={textSize >= maxTextSize} title="Increase text size">
                    <ZoomIn />
                  </Button>
                </div>

                {/* Fullscreen button */}
                <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (F11)'} className="hover:bg-zinc-700">
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>

                {/* Edit button */}
                {!edit && (
                  <Button onClick={() => setEdit(true)} size="sm" className={`${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white`}>
                    <Edit2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={isFullscreen ? `flex h-screen w-full flex-col justify-start overflow-y-auto p-8 pt-24 md:pt-20 ${isDarkMode ? 'bg-zinc-950' : 'bg-white'}` : 'container mx-auto max-w-4xl px-4 py-6'}
      >
        <AnimatePresence mode="wait">
          {!edit ? (
            <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              {isFullscreen ? (
                <div className="flex w-full flex-col">
                  {/* Song title at top for fullscreen */}
                  <div className="mb-8 text-center md:hidden">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{song.title}</h1>
                    <p className={`text-lg ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>{song.artist}</p>
                  </div>

                  {/* Fullscreen font controls for mobile only */}
                  <div className="mb-8 flex items-center justify-center gap-4 md:hidden">
                    <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-black/30 p-1 backdrop-blur-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => adjustTextSize(-2)}
                        disabled={textSize <= minTextSize}
                        title="Decrease text size"
                        className="rounded-md text-white hover:bg-white/20"
                      >
                        <ZoomOut className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTextSize(defaultTextSize)}
                        disabled={textSize === defaultTextSize}
                        title="Reset text size"
                        className="rounded-md text-white hover:bg-white/20"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => adjustTextSize(2)}
                        disabled={textSize >= maxTextSize}
                        title="Increase text size"
                        className="rounded-md text-white hover:bg-white/20"
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                      <span className="ml-2 w-12 text-center text-sm text-white">{Math.round((textSize / 16) * 100)}%</span>
                    </div>
                  </div>

                  {/* Lyrics content */}
                  <div className={`w-full max-w-none flex-1 whitespace-pre-wrap text-center leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: `${textSize + 8}px` }}>
                    {lyrics || <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No lyrics available for this song.</span>}
                  </div>
                </div>
              ) : (
                <Card className={`p-6 sm:p-8 ${THEME.bg} border ${THEME.border}`}>
                  <div className={`whitespace-pre-wrap ${THEME.text} leading-relaxed`} style={{ fontSize: `${textSize}px` }}>
                    {lyrics || <span className={THEME.textSecondary}>No lyrics available for this song.</span>}
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <Card className={`p-4 sm:p-6 ${THEME.bg} border ${THEME.border}`}>
                {/* Save status feedback */}
                {saveStatus !== 'idle' && (
                  <div
                    className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
                      saveStatus === 'success' ? 'bg-green-500/10 text-green-400' : saveStatus === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saveStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                    {saveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                    <span className="text-sm">
                      {saveStatus === 'saving' && 'Saving lyrics...'}
                      {saveStatus === 'success' && 'Lyrics saved successfully!'}
                      {saveStatus === 'error' && (error || 'Failed to save lyrics')}
                    </span>
                  </div>
                )}

                <textarea
                  value={lyrics ?? ''}
                  onChange={(e) => setLyrics(e.target.value)}
                  className={`min-h-[60vh] w-full rounded-md p-4 ${THEME.bg} ${THEME.text} border ${THEME.border} resize-none font-mono focus:outline-none focus:ring-2 focus:ring-rose-400`}
                  style={{ fontSize: `${Math.max(14, textSize - 2)}px` }}
                  placeholder="Enter lyrics here..."
                  autoFocus
                />

                {/* Action buttons */}
                <div className="mt-4 flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving} className={`${THEME.text} border ${THEME.border} hover:${THEME.highlight}`}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || lyrics === song.lyrics} className={`${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white ${isSaving ? 'opacity-50' : ''}`}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile-friendly tips */}
        {!isFullscreen && (
          <div className={`mt-4 text-center text-sm ${THEME.textSecondary}`}>
            {!edit ? (
              <p>
                Tip: Use the zoom controls to adjust text size • Press F11 or click maximize to go fullscreen • Press Ctrl/Cmd+E to edit
                {playlist.length > 0 && ' • Use arrow keys in fullscreen to navigate setlist'}
              </p>
            ) : (
              <p>Tip: Press Ctrl/Cmd+S to save • Esc to cancel</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
