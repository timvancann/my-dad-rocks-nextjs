'use client';

import { SongType } from '@/lib/interface';
import { markSongPracticed } from '@/actions/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { THEME } from '@/themes';
import { 
  MoreVertical, 
  FileText, 
  Info, 
  Music, 
  Hash, 
  StickyNote, 
  CheckCircle2, 
  CirclePlus, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import { TbListDetails } from 'react-icons/tb';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface SongMenuProps {
  song: SongType;
  removeFromSetlistFn?: () => void;
  addToSetlistFn?: () => void;
  onShowNotes?: () => void;
}

export const SongMenu = ({ song, removeFromSetlistFn, addToSetlistFn, onShowNotes }: SongMenuProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPracticeMarking, setIsPracticeMarking] = useState(false);
  const [showPracticeSuccess, setShowPracticeSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkPracticed = async () => {
    setIsPracticeMarking(true);
    try {
      await markSongPracticed(song._id);
      setShowPracticeSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['songStats', song._id] });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      
      setTimeout(() => {
        setShowPracticeSuccess(false);
        setIsOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Error marking song as practiced:', error);
    } finally {
      setIsPracticeMarking(false);
    }
  };

  const MenuDivider = () => (
    <div className={`my-1 h-px ${THEME.border}`} />
  );

  const MenuItem = ({ 
    icon, 
    label, 
    onClick, 
    danger = false,
    success = false,
    disabled = false,
    rightContent
  }: { 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
    danger?: boolean;
    success?: boolean;
    disabled?: boolean;
    rightContent?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-sm transition-colors
        ${danger ? 'text-red-400 hover:bg-red-800/20' : success ? 'text-green-400 hover:bg-green-800/20' : `${THEME.text} hover:${THEME.highlight}`}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {rightContent}
    </button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={`p-1.5 rounded-full transition-colors hover:${THEME.highlight} ${THEME.textSecondary}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={`w-56 p-1 ${THEME.bg} ${THEME.border} border rounded-md shadow-lg`}
        align="end"
        sideOffset={5}
      >
        <div className="flex flex-col">
          {/* Song Info Section */}
          <div className={`px-2 py-1.5 text-xs ${THEME.textSecondary}`}>
            <div className="font-semibold">{song.title}</div>
            <div>{song.artist}</div>
          </div>
          
          <MenuDivider />

          {/* Navigation Actions */}
          <MenuItem
            icon={<FileText className="h-4 w-4" />}
            label="View Lyrics"
            onClick={() => {
              router.push(`/practice/lyrics/${song.slug || song._id}`);
              setIsOpen(false);
            }}
            rightContent={<ChevronRight className="h-3 w-3 opacity-50" />}
          />
          
          <MenuItem
            icon={<TbListDetails className="h-4 w-4" />}
            label="Song Details"
            onClick={() => {
              router.push(`/practice/song/${song.slug || song._id}`);
              setIsOpen(false);
            }}
            rightContent={<ChevronRight className="h-3 w-3 opacity-50" />}
          />

          {onShowNotes && song.notes && (
            <MenuItem
              icon={<StickyNote className="h-4 w-4" />}
              label="Toggle Notes"
              onClick={() => {
                onShowNotes();
                setIsOpen(false);
              }}
            />
          )}

          <MenuDivider />

          {/* Song Info */}
          {((song as any).key_signature || (song as any).tempo_bpm) && (
            <>
              <div className={`px-2 py-1 text-xs ${THEME.textSecondary}`}>
                {(song as any).key_signature && (
                  <div className="flex items-center gap-2 py-0.5">
                    <Hash className="h-3 w-3" />
                    <span>Key: {(song as any).key_signature}</span>
                  </div>
                )}
                {(song as any).tempo_bpm && (
                  <div className="flex items-center gap-2 py-0.5">
                    <Music className="h-3 w-3" />
                    <span>BPM: {(song as any).tempo_bpm}</span>
                  </div>
                )}
              </div>
              <MenuDivider />
            </>
          )}

          {/* Actions */}
          <MenuItem
            icon={<CheckCircle2 className={`h-4 w-4 ${showPracticeSuccess ? 'scale-110' : ''} transition-transform`} />}
            label={showPracticeSuccess ? "Marked!" : "Mark as Practiced"}
            onClick={handleMarkPracticed}
            disabled={isPracticeMarking}
            success={showPracticeSuccess}
          />

          {removeFromSetlistFn && (
            <MenuItem
              icon={<Trash2 className="h-4 w-4" />}
              label="Remove from Setlist"
              onClick={() => {
                removeFromSetlistFn();
                setIsOpen(false);
              }}
              danger
            />
          )}
          
          {addToSetlistFn && (
            <MenuItem
              icon={<CirclePlus className="h-4 w-4" />}
              label="Add to Setlist"
              onClick={() => {
                addToSetlistFn();
                setIsOpen(false);
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};