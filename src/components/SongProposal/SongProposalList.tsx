'use client';

import { ProposedSong } from '@/app/(frontend)/practice/musicbrains/page';
import { ProposedSongCard } from './ProposedSongCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SongType } from '@/lib/interface';

interface SongProposalListProps {
  proposedSongs: ProposedSong[];
  onRemove?: (index: number) => void;
  onAddToRepertoire?: (song: SongType) => void;
}

export const SongProposalList = ({ proposedSongs, onRemove, onAddToRepertoire }: SongProposalListProps) => {
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all');
  const [acceptedSongs, setAcceptedSongs] = useState<Set<string>>(new Set());
  const [rejectedSongs, setRejectedSongs] = useState<Set<string>>(new Set());

  const handleAccept = (song: ProposedSong) => {
    setAcceptedSongs((prev) => {
      const updated = new Set(prev);
      updated.add(song.mbid);
      
      // Remove from rejected if it was there
      if (rejectedSongs.has(song.mbid)) {
        setRejectedSongs((rejected) => {
          const updatedRejected = new Set(rejected);
          updatedRejected.delete(song.mbid);
          return updatedRejected;
        });
      }
      
      return updated;
    });
    
    if (onAddToRepertoire) {
      // Convert ProposedSong to SongType for repertoire
      const newSong: SongType = {
        _id: song.mbid,
        title: song.title,
        artist: song.artist,
        artwork: song.artwork || '/placeholder-cover.jpg',
        dualGuitar: song.dualGuitar,
        dualVocal: song.dualVocal,
        duration: song.duration,
        notes: song.notes
      };
      
      onAddToRepertoire(newSong);
    }
  };

  const handleReject = (song: ProposedSong) => {
    setRejectedSongs((prev) => {
      const updated = new Set(prev);
      updated.add(song.mbid);
      
      // Remove from accepted if it was there
      if (acceptedSongs.has(song.mbid)) {
        setAcceptedSongs((accepted) => {
          const updatedAccepted = new Set(accepted);
          updatedAccepted.delete(song.mbid);
          return updatedAccepted;
        });
      }
      
      return updated;
    });
  };

  const getFilteredSongs = () => {
    switch (filter) {
      case 'accepted':
        return proposedSongs.filter((song) => acceptedSongs.has(song.mbid));
      case 'rejected':
        return proposedSongs.filter((song) => rejectedSongs.has(song.mbid));
      case 'pending':
        return proposedSongs.filter((song) => !acceptedSongs.has(song.mbid) && !rejectedSongs.has(song.mbid));
      case 'all':
      default:
        return proposedSongs;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Proposed Songs</h2>
        <div className="flex space-x-2">
          <FilterButton 
            label="All" 
            isActive={filter === 'all'} 
            onClick={() => setFilter('all')} 
          />
          <FilterButton 
            label={`Accepted (${acceptedSongs.size})`} 
            isActive={filter === 'accepted'} 
            onClick={() => setFilter('accepted')} 
          />
          <FilterButton 
            label={`Pending (${proposedSongs.length - acceptedSongs.size - rejectedSongs.size})`} 
            isActive={filter === 'pending'} 
            onClick={() => setFilter('pending')} 
          />
          <FilterButton 
            label={`Rejected (${rejectedSongs.size})`} 
            isActive={filter === 'rejected'} 
            onClick={() => setFilter('rejected')} 
          />
        </div>
      </div>
      
      {getFilteredSongs().length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
          {proposedSongs.length === 0 ? (
            <>
              <p className="text-zinc-400">No songs have been proposed yet</p>
              <p className="mt-2 text-sm text-zinc-500">Use the search tool to find and propose songs</p>
            </>
          ) : (
            <>
              <p className="text-zinc-400">No songs match the current filter</p>
              <p className="mt-2 text-sm text-zinc-500">Try selecting a different filter option</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {getFilteredSongs().map((song, index) => (
            <ProposedSongCard 
              key={song.mbid + index}
              song={song}
              onAccept={!acceptedSongs.has(song.mbid) ? handleAccept : undefined}
              onReject={!rejectedSongs.has(song.mbid) ? handleReject : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton = ({ label, isActive, onClick }: FilterButtonProps) => (
  <Button
    size="sm"
    variant={isActive ? "default" : "outline"}
    onClick={onClick}
    className={isActive ? "" : "text-zinc-400"}
  >
    {label}
  </Button>
);