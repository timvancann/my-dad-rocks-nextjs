'use client';

import { modifyLyrics } from '@/actions/supabase';
import { LyricType } from '@/lib/interface';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import {
  ChevronLeft,
  Edit2,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  CheckCircle,
  Maximize,
  Minimize
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';

export default function DisplayLyrics({ song, songId }: { song: LyricType; songId: string }) {
  const router = useRouter();
  const { isFullscreen, setIsFullscreen } = usePlayerStore();
  const [edit, setEdit] = useState(false);
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [textSize, setTextSize] = useState(16); // Base font size in pixels
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const minTextSize = 12;
  const maxTextSize = 32;

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
    setTextSize(prev => Math.max(minTextSize, Math.min(maxTextSize, prev + delta)));
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [edit, lyrics, handleSave, handleCancel, isFullscreen, exitFullscreen, toggleFullscreen]);

  return (
    <div className="min-h-screen">
      {/* Floating exit fullscreen button */}
      {isFullscreen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={exitFullscreen}
          className="fixed top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white border border-white/20 rounded-full w-12 h-12"
          title="Exit fullscreen (Esc)"
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile-optimized header */}
      {!isFullscreen && (
        <div className={`sticky top-0 z-10 ${THEME.bg} border-b ${THEME.border} shadow-sm`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="text-center flex-1 mx-2 sm:mx-4 min-w-0">
              <h1 className={`text-base sm:text-xl font-bold ${THEME.text} truncate`}>{song.title}</h1>
              <p className={`text-xs sm:text-sm ${THEME.textSecondary} truncate`}>{song.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Text size controls */}
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => adjustTextSize(-2)}
                  disabled={textSize <= minTextSize}
                  title="Decrease text size"
                >
                  <ZoomOut />
                </Button>
                <span className={`hidden sm:inline text-xs ${THEME.textSecondary} w-12 text-center`}>
                  {Math.round((textSize / 16) * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => adjustTextSize(2)}
                  disabled={textSize >= maxTextSize}
                  title="Increase text size"
                >
                  <ZoomIn />
                </Button>
              </div>

              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen (F11)"}
                className="hover:bg-zinc-700"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              {/* Edit button */}
              {!edit && (
                <Button
                  onClick={() => setEdit(true)}
                  size="sm"
                  className={`${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white`}
                >
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
      <div className={isFullscreen ? "w-full h-screen flex flex-col justify-start p-8 pt-16 overflow-y-auto" : "container mx-auto px-4 py-6 max-w-4xl"}>
        <AnimatePresence mode="wait">
          {!edit ? (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {isFullscreen ? (
                <div className="w-full flex flex-col">
                  {/* Fullscreen font controls */}
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 backdrop-blur-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => adjustTextSize(-2)}
                        disabled={textSize <= minTextSize}
                        title="Decrease text size"
                        className="text-white hover:bg-white/20"
                      >
                        <ZoomOut className="h-5 w-5" />
                      </Button>
                      <span className="text-white text-sm w-16 text-center">
                        {Math.round((textSize / 16) * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => adjustTextSize(2)}
                        disabled={textSize >= maxTextSize}
                        title="Increase text size"
                        className="text-white hover:bg-white/20"
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Lyrics content */}
                  <div
                    className={`whitespace-pre-wrap ${THEME.text} leading-relaxed text-center max-w-none w-full flex-1`}
                    style={{ fontSize: `${textSize + 8}px` }}
                  >
                    {lyrics || (
                      <span className={THEME.textSecondary}>No lyrics available for this song.</span>
                    )}
                  </div>
                </div>
              ) : (
                <Card className={`p-6 sm:p-8 ${THEME.bg} border ${THEME.border}`}>
                  <div
                    className={`whitespace-pre-wrap ${THEME.text} leading-relaxed`}
                    style={{ fontSize: `${textSize}px` }}
                  >
                    {lyrics || (
                      <span className={THEME.textSecondary}>No lyrics available for this song.</span>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Card className={`p-4 sm:p-6 ${THEME.bg} border ${THEME.border}`}>
                {/* Save status feedback */}
                {saveStatus !== 'idle' && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${saveStatus === 'success' ? 'bg-green-500/10 text-green-400' :
                      saveStatus === 'error' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                    }`}>
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
                  className={`w-full min-h-[60vh] p-4 rounded-md ${THEME.bg} ${THEME.text} border ${THEME.border}
                    focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none font-mono`}
                  style={{ fontSize: `${Math.max(14, textSize - 2)}px` }}
                  placeholder="Enter lyrics here..."
                  autoFocus
                />

                {/* Action buttons */}
                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className={`${THEME.text} border ${THEME.border} hover:${THEME.highlight}`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || lyrics === song.lyrics}
                    className={`${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white ${isSaving ? 'opacity-50' : ''
                      }`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
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
              <p>Tip: Use the zoom controls to adjust text size • Press F11 or click maximize to go fullscreen • Press Ctrl/Cmd+E to edit</p>
            ) : (
              <p>Tip: Press Ctrl/Cmd+S to save • Esc to cancel</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
