'use client';

import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Mic, Repeat, RotateCcw, ChevronsLeft, Plus, Edit3, Trash2, MoreHorizontal, ChevronDown, ChevronUp, GripVertical, SquareArrowLeft } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useSongSections } from '@/hooks/useSongSections';

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
  const { sections, loading: sectionsLoading, editingMarkerId, setEditingMarkerId, addSection, updateSection, removeSection, jumpToSection } = useSongSections();
  
  const [newMarkerName, setNewMarkerName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [showMarkerList, setShowMarkerList] = useState(false);
  const [draggedMarkerId, setDraggedMarkerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);

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

  const playFromA = useCallback(() => {
    if (loopMarkers.start !== null) {
      seekTrack(loopMarkers.start);
    }
  }, [loopMarkers.start, seekTrack]);

  const restartFromBeginning = useCallback(() => {
    seekTrack(0);
  }, [seekTrack]);

  // Section marker functions
  const handleAddMarker = useCallback(async () => {
    if (!newMarkerName.trim()) return;
    
    try {
      await addSection(newMarkerName.trim(), time);
      setNewMarkerName('');
    } catch (error) {
      console.error('Failed to add marker:', error);
    }
  }, [newMarkerName, time, addSection]);

  const handleQuickAddMarker = useCallback(async () => {
    try {
      const newSection = await addSection(`Marker ${formatTime(time)}`, time);
      if (newSection) {
        setEditingMarkerId(newSection.id);
        setEditingName(newSection.name);
      }
    } catch (error) {
      console.error('Failed to add marker:', error);
    }
  }, [time, addSection, setEditingMarkerId, formatTime]);

  const handleEditMarker = useCallback(async (id: string) => {
    if (!editingName.trim()) return;
    
    try {
      await updateSection(id, { name: editingName.trim() });
      setEditingMarkerId(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to update marker:', error);
    }
  }, [editingName, updateSection, setEditingMarkerId]);

  const handleDeleteMarker = useCallback(async (id: string) => {
    try {
      await removeSection(id);
    } catch (error) {
      console.error('Failed to delete marker:', error);
    }
  }, [removeSection]);

  const startEditing = useCallback((section: any) => {
    setEditingMarkerId(section.id);
    setEditingName(section.name);
  }, [setEditingMarkerId]);

  // Listen for seek events from section markers
  useEffect(() => {
    const handleSeekTo = (event: any) => {
      seekTrack(event.detail);
    };

    window.addEventListener('seekTo', handleSeekTo);
    return () => window.removeEventListener('seekTo', handleSeekTo);
  }, [seekTrack]);

  // Calculate marker position percentage
  const getMarkerPosition = useCallback((startTime: number) => {
    if (!duration) return 0;
    return (startTime / duration) * 100;
  }, [duration]);

  // Mouse/Touch drag handling functions
  const handleMarkerMouseDown = useCallback((e: React.MouseEvent, markerId: string, startTime: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedMarkerId(markerId);
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartTime(startTime);
  }, []);

  const handleMarkerTouchStart = useCallback((e: React.TouchEvent, markerId: string, startTime: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    if (touch) {
      setDraggedMarkerId(markerId);
      setIsDragging(true);
      setDragStartX(touch.clientX);
      setDragStartTime(startTime);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedMarkerId || !waveformRef.current || !duration) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const deltaPercentage = deltaX / rect.width;
    const deltaTime = deltaPercentage * duration;
    
    const newTime = Math.max(0, Math.min(duration, dragStartTime + deltaTime));
    
    // Update the marker position immediately for smooth dragging
    const marker = sections.find(s => s.id === draggedMarkerId);
    if (marker) {
      marker.start_time = newTime;
    }
  }, [isDragging, draggedMarkerId, duration, dragStartX, dragStartTime, sections]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !draggedMarkerId || !waveformRef.current || !duration) return;

    const touch = e.touches[0];
    if (!touch) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const deltaX = touch.clientX - dragStartX;
    const deltaPercentage = deltaX / rect.width;
    const deltaTime = deltaPercentage * duration;
    
    const newTime = Math.max(0, Math.min(duration, dragStartTime + deltaTime));
    
    // Update the marker position immediately for smooth dragging
    const marker = sections.find(s => s.id === draggedMarkerId);
    if (marker) {
      marker.start_time = newTime;
    }
  }, [isDragging, draggedMarkerId, duration, dragStartX, dragStartTime, sections]);

  const handleMouseUp = useCallback(async () => {
    if (!isDragging || !draggedMarkerId) return;

    const marker = sections.find(s => s.id === draggedMarkerId);
    if (marker) {
      try {
        await updateSection(draggedMarkerId, { start_time: marker.start_time });
      } catch (error) {
        console.error('Failed to update marker position:', error);
      }
    }

    setIsDragging(false);
    setDraggedMarkerId(null);
    setDragStartX(0);
    setDragStartTime(0);
  }, [isDragging, draggedMarkerId, sections, updateSection]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging || !draggedMarkerId) return;

    const marker = sections.find(s => s.id === draggedMarkerId);
    if (marker) {
      try {
        await updateSection(draggedMarkerId, { start_time: marker.start_time });
      } catch (error) {
        console.error('Failed to update marker position:', error);
      }
    }

    setIsDragging(false);
    setDraggedMarkerId(null);
    setDragStartX(0);
    setDragStartTime(0);
  }, [isDragging, draggedMarkerId, sections, updateSection]);

  // Mouse and Touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);


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
            className="absolute top-16 sm:top-20 left-2 right-2 bottom-2 sm:left-4 sm:right-4 sm:bottom-4 md:top-24 md:left-8 md:right-8 md:bottom-8 lg:top-28 lg:left-16 lg:right-16 lg:bottom-16 bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10">
              <h2 className="text-base sm:text-lg font-semibold">Now Playing</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${THEME.highlight} hover:bg-zinc-700 transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main content */}
            <div className="h-full flex flex-col items-center p-4 sm:p-6 pb-16 sm:pb-20 overflow-y-auto overflow-x-hidden pt-16 sm:pt-20">
              {/* Song info */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{selectedSong.title}</h1>
                <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-2 sm:mb-3">{selectedSong.artist}</p>
                
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
              <div className="w-full max-w-4xl mb-4 sm:mb-6">
                <div ref={waveformRef} className="mb-2 relative">
                  <WaveformVisualizer 
                    song={selectedSong}
                    isPlaying={!paused && !isChangingSong}
                    currentTime={time}
                    onSeek={seekTrack}
                    loopMarkers={loopMarkers}
                    setLoopMarkers={setLoopMarkers}
                    isLoopEnabled={isLoopEnabled}
                  />
                  
                  {/* Visual markers below waveform */}
                  <div className="relative h-8 mt-2 border-t border-zinc-700">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="absolute flex flex-col items-center group select-none"
                        style={{ 
                          left: `calc(${getMarkerPosition(section.start_time)}% - 6px)`,
                          top: '2px'
                        }}
                      >
                        {/* Marker line */}
                        <div 
                          className="w-0.5 h-4 opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: section.color }}
                        />
                        
                        {/* Drag handle */}
                        <div 
                          className={`w-3 h-3 rounded-full border border-white opacity-80 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing flex items-center justify-center mt-0.5 touch-none ${
                            draggedMarkerId === section.id ? 'scale-125 opacity-100' : ''
                          }`}
                          style={{ backgroundColor: section.color }}
                          onMouseDown={(e) => handleMarkerMouseDown(e, section.id, section.start_time)}
                          onTouchStart={(e) => handleMarkerTouchStart(e, section.id, section.start_time)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDragging) {
                              jumpToSection(section);
                            }
                          }}
                        >
                          <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                        </div>
                        
                        {/* Marker label on hover */}
                        <div className="absolute top-full mt-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {section.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm tabular-nums text-zinc-400">
                  <span>{formatTime(time)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Section Markers */}
              <div className="w-full max-w-4xl mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Section Markers</h3>
                    <button
                      onClick={() => setShowMarkerList(!showMarkerList)}
                      className={`p-1 rounded ${THEME.highlight} hover:bg-zinc-700 transition-colors`}
                    >
                      {showMarkerList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleQuickAddMarker}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${THEME.primaryBg} text-white hover:bg-red-700 flex items-center gap-1.5`}
                  >
                    <Plus className="h-4 w-4" />
                    Add at {formatTime(time)}
                  </button>
                </div>
                
                {showMarkerList && (
                  <div>
                    {/* Add new marker with custom name */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newMarkerName}
                        onChange={(e) => setNewMarkerName(e.target.value)}
                        placeholder="Custom marker name (optional)"
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddMarker();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddMarker}
                        disabled={!newMarkerName.trim()}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${THEME.primaryBg} text-white hover:bg-red-700`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Markers list */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {sectionsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="h-6 w-6 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin"></div>
                        </div>
                      ) : sections.length === 0 ? (
                        <p className="text-zinc-400 text-sm text-center py-4">No markers yet. Add one at the current time!</p>
                      ) : (
                        sections.map((section) => (
                          <div key={section.id} className="flex items-center gap-2 p-2 bg-zinc-800 rounded-md">
                            <div 
                              className="w-3 h-3 rounded-full border-2 border-white" 
                              style={{ backgroundColor: section.color }}
                            />
                            
                            {editingMarkerId === section.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditMarker(section.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingMarkerId(null);
                                    setEditingName('');
                                  }
                                }}
                                onBlur={() => handleEditMarker(section.id)}
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="flex-1 text-sm cursor-pointer hover:text-white"
                                onClick={() => startEditing(section)}
                              >
                                {section.name}
                              </span>
                            )}
                            
                            <span className="text-xs text-zinc-400 tabular-nums">
                              {formatTime(section.start_time)}
                            </span>
                            
                            <button
                              onClick={() => jumpToSection(section)}
                              className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                            >
                              Jump
                            </button>
                            
                            <button
                              onClick={() => handleDeleteMarker(section.id)}
                              className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
                <button 
                  className={`p-2 sm:p-3 ${THEME.text} hover:${THEME.primary} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={restartFromBeginning}
                  disabled={isChangingSong}
                  title="Restart from beginning"
                >
                  <SquareArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
                
                <button 
                  className={`p-2 sm:p-3 ${THEME.text} hover:${THEME.primary} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={previousTrack}
                  disabled={isChangingSong}
                >
                  <SkipBack className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
                
                <button 
                  className={`${THEME.primaryBg} rounded-full p-3 sm:p-5 text-white shadow-lg shadow-red-900/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={playPauseTrack}
                  disabled={isLoading || isChangingSong}
                >
                  {(isLoading || isChangingSong) ? (
                    <div className="h-6 w-6 sm:h-8 sm:w-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : paused ? (
                    <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-0.5 sm:ml-1" />
                  ) : (
                    <Pause className="h-6 w-6 sm:h-8 sm:w-8" />
                  )}
                </button>
                
                <button 
                  className={`p-2 sm:p-3 ${THEME.text} hover:${THEME.primary} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`} 
                  onClick={nextTrack}
                  disabled={isChangingSong}
                >
                  <SkipForward className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              </div>

              {/* Loop controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Marker buttons - full width on mobile */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    className={`flex-1 sm:flex-initial px-4 py-3 sm:px-3 sm:py-2 rounded-lg sm:rounded-md text-sm font-medium transition-colors ${
                      loopMarkers.start !== null 
                        ? `${THEME.primaryBg} text-white` 
                        : `${THEME.highlight} ${THEME.text} hover:bg-zinc-700`
                    }`}
                    onClick={setMarkerA}
                    title="Set A marker"
                  >
                    A: {loopMarkers.start !== null ? formatTime(loopMarkers.start) : '--:--'}
                  </button>
                  
                  <button 
                    className={`flex-1 sm:flex-initial px-4 py-3 sm:px-3 sm:py-2 rounded-lg sm:rounded-md text-sm font-medium transition-colors ${
                      loopMarkers.end !== null 
                        ? `${THEME.primaryBg} text-white` 
                        : `${THEME.highlight} ${THEME.text} hover:bg-zinc-700`
                    }`}
                    onClick={setMarkerB}
                    title="Set B marker"
                  >
                    B: {loopMarkers.end !== null ? formatTime(loopMarkers.end) : '--:--'}
                  </button>
                </div>

                {/* Action buttons - larger touch targets on mobile */}
                <div className="flex items-center gap-2">
                  <button 
                    className={`p-3 sm:p-2 rounded-lg sm:rounded-md transition-colors ${
                      isLoopEnabled 
                        ? `${THEME.primaryBg} text-white shadow-lg` 
                        : `${THEME.highlight} ${THEME.text} hover:bg-zinc-700`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={toggleLoop}
                    disabled={loopMarkers.start === null || loopMarkers.end === null}
                    title={`${isLoopEnabled ? 'Disable' : 'Enable'} loop`}
                  >
                    <Repeat className="h-5 w-5" />
                  </button>
                  
                  <button 
                    className={`p-3 sm:p-2 rounded-lg sm:rounded-md ${THEME.highlight} ${THEME.text} hover:bg-zinc-700 transition-colors`}
                    onClick={clearMarkers}
                    title="Clear markers"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  
                  <button 
                    className={`p-3 sm:p-2 rounded-lg sm:rounded-md ${THEME.highlight} ${THEME.text} hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={playFromA}
                    disabled={loopMarkers.start === null}
                    title="Play from A marker"
                  >
                    <ChevronsLeft className="h-5 w-5" />
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