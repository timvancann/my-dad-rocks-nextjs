'use client';

import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { Clock, Hash, Mic, Music, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { SongDetailDrawer } from './Drawer';

interface SongCardProps {
  song: SongType;
  playlist: SongType[];
  removeFromSetlistFn?: () => void;
  addToSetlistFn?: () => void;
}

export const SongCard = ({ song, playlist, removeFromSetlistFn, addToSetlistFn }: SongCardProps) => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSongIndex = usePlayerStore((state) => state.setSongIndex);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);
  const [showNotes, setShowNotes] = useState(false);

  const isSelected = selectedSong?._id === song._id;

  return (
    <div className="w-full">
      <div className={'flex grow items-center justify-between'}>
        <div
          className="flex grow cursor-pointer"
          onClick={() => {
            const currentIndex = playlist.findIndex((s) => s._id === song._id);
            setPlaylist(playlist);
            setSongIndex(currentIndex);
          }}
        >
          <div className="relative mr-3 p-1">
            {isSelected && <div className="absolute -inset-0.5 z-0 rounded-full border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black"></div>}
            <img src={song.artwork} alt={song.title} className={`relative z-10 h-14 w-14 ${isSelected ? 'rounded-full ring-1 ring-red-500/30' : 'rounded-md'}`} />
            {/* Center hole of vinyl for playing song */}
            {isSelected && <div className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900"></div>}
          </div>
          <div className="flex-1 grow">
            <h3 className={`truncate font-semibold ${isSelected ? THEME.primary : ''}`}>{song.title}</h3>
            <p className={`truncate text-xs ${THEME.textSecondary}`}>{song.artist}</p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="flex gap-1.5">
                {song.dualGuitar && (
                  <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full p-1 text-xs`}>
                    <TbGuitarPickFilled className={`h-3 w-3 ${THEME.primary}`} />
                  </div>
                )}
                {song.dualVocal && (
                  <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full p-1 text-xs`}>
                    <Mic className={`h-3 w-3 ${THEME.secondary}`} />
                  </div>
                )}
              </div>
              {/* Key and Tempo info - right aligned with backgrounds */}
              <div className={`flex items-center gap-1.5 text-xs`}>
                {(song as any).key_signature && (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${THEME.highlight} ${THEME.text}`}>
                    <Hash className="h-3 w-3 opacity-60" />
                    {(song as any).key_signature}
                  </span>
                )}
                {(song as any).tempo_bpm && (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${THEME.highlight} ${THEME.text}`}>
                    <Music className="h-3 w-3 opacity-60" />
                    {(song as any).tempo_bpm}
                  </span>
                )}
                {song.notes && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotes(!showNotes);
                    }}
                    className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${showNotes ? THEME.primaryBg : THEME.highlight} ${showNotes ? 'text-white' : THEME.text} hover:${THEME.primaryBg} hover:text-white transition-colors`}
                  >
                    <StickyNote className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <span className={`ml-1 flex items-center gap-0.5 whitespace-nowrap text-xs ${THEME.textSecondary}`}>
            <Clock className="h-3 w-3" /> {new Date(song.duration * 1000).toISOString().slice(15, 19)}
          </span>
          <div className={`mt-4 flex justify-end rounded-full ${THEME.textSecondary}`}>
            <SongDetailDrawer setShowNotes={() => {
              setShowNotes(!showNotes)}}
            song={song} removeFromSetlistFn={removeFromSetlistFn} addToSetlistFn={addToSetlistFn} />
          </div>
        </div>
      </div>
      {/* Notes expansion */}
      {showNotes && song.notes && (
        <div className={`mt-2 p-3 rounded-md ${THEME.highlight} border ${THEME.border} text-sm ${THEME.text}`}>
          <div className="flex items-start gap-2">
            <StickyNote className={`h-4 w-4 ${THEME.secondary} mt-0.5 shrink-0`} />
            <p className="whitespace-pre-wrap">{song.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};