'use client';

import { SongType } from '@/lib/interface';
import { THEME } from '@/themes';
import { X, Search, Clock, Mic, Plus, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { Button } from '@/components/ui/button';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableSongs: SongType[];
  excludeSongs: SongType[];
  onAddSong: (song: SongType) => Promise<void>;
}

export const AddSongModal = ({ 
  isOpen, 
  onClose, 
  availableSongs, 
  excludeSongs, 
  onAddSong 
}: AddSongModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);

  // Filter songs based on search term and exclude already added songs
  const filteredSongs = useMemo(() => {
    const excludeIds = new Set(excludeSongs.map(song => song._id));
    return availableSongs
      .filter(song => !excludeIds.has(song._id))
      .filter(song => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          song.title.toLowerCase().includes(term) ||
          song.artist?.toLowerCase().includes(term)
        );
      });
  }, [availableSongs, excludeSongs, searchTerm]);

  const handleAddSong = async (song: SongType) => {
    if (loadingSongId) return;
    
    setLoadingSongId(song._id);
    try {
      await onAddSong(song);
    } finally {
      setLoadingSongId(null);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="absolute top-4 left-4 right-4 bottom-4 sm:top-8 sm:left-8 sm:right-8 sm:bottom-8 md:top-16 md:left-16 md:right-16 md:bottom-16 lg:top-20 lg:left-32 lg:right-32 lg:bottom-20 bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-800 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold">Add Songs to Setlist</h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-full ${THEME.highlight} hover:bg-zinc-700 transition-colors`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs by title or artist..."
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} available
            </p>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
            {filteredSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">
                  {searchTerm ? 'No songs found' : 'All songs added'}
                </h3>
                <p className="text-zinc-400">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'All available songs have been added to this setlist'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSongs.map((song) => {
                  const isLoading = loadingSongId === song._id;
                  
                  return (
                    <div 
                      key={song._id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${THEME.highlight} ${THEME.border} hover:bg-zinc-750`}
                    >
                      {/* Song Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img 
                          src={song.artwork} 
                          alt={song.title} 
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold truncate ${THEME.text}`}>
                            {song.title}
                          </h3>
                          <p className={`text-sm truncate ${THEME.textSecondary}`}>
                            {song.artist}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`flex items-center gap-1 text-xs ${THEME.textSecondary}`}>
                              <Clock className="h-3 w-3" />
                              {new Date(song.duration * 1000).toISOString().slice(15, 19)}
                            </span>
                            {song.dualGuitar && (
                              <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full px-2 py-0.5`}>
                                <TbGuitarPickFilled className={`h-3 w-3 ${THEME.primary}`} />
                              </div>
                            )}
                            {song.dualVocal && (
                              <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full px-2 py-0.5`}>
                                <Mic className={`h-3 w-3 ${THEME.secondary}`} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        onClick={() => handleAddSong(song)}
                        disabled={isLoading}
                        size="sm"
                        className={`ml-3 transition-colors ${THEME.primaryBg} hover:bg-red-700 text-white`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-zinc-800 flex justify-end flex-shrink-0">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              Done
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};