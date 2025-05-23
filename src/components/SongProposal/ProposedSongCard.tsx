'use client';

import { Clock, Mic, Check, X } from 'lucide-react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { ProposedSong } from '@/app/(frontend)/practice/musicbrains/page';

interface ProposedSongCardProps {
  song: ProposedSong;
  onAccept?: (song: ProposedSong) => void;
  onReject?: (song: ProposedSong) => void;
}

export const ProposedSongCard = ({ song, onAccept, onReject }: ProposedSongCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative flex items-center justify-between rounded-lg bg-zinc-900 p-4 transition-all hover:bg-zinc-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Image 
            src={song.artwork || "/images/no-cover.svg"} 
            alt={song.title} 
            width={64}
            height={64}
            className="h-16 w-16 rounded-md object-cover shadow-md"
            unoptimized={!song.artwork}
            onError={(e) => {
              // @ts-ignore
              e.target.src = "/images/no-cover.svg";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black bg-opacity-70 rounded-md group-hover:opacity-100 transition-opacity">
            <a 
              href={`https://musicbrainz.org/recording/${song.mbid.split('/')[0]}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-white hover:underline"
            >
              View on MusicBrainz
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white">{song.title}</h3>
          <p className="text-zinc-400">{song.artist}</p>
          <p className="text-sm text-zinc-500">{song.album}</p>
          <a 
            href={`https://musicbrainz.org/recording/${song.mbid}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-400 hover:underline"
          >
            View on MusicBrainz
          </a>
          
          <div className="mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" /> {formatDuration(song.duration)}
            </span>
            
            {song.dualGuitar && (
              <span className="flex items-center gap-1 rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-500">
                <TbGuitarPickFilled className="h-3 w-3" /> Dual Guitar
              </span>
            )}
            
            {song.dualVocal && (
              <span className="flex items-center gap-1 rounded-full bg-purple-900/30 px-2 py-0.5 text-xs text-purple-500">
                <Mic className="h-3 w-3" /> Dual Vocal
              </span>
            )}
          </div>
        </div>
      </div>
      
      {song.notes && (
        <div className="ml-4 hidden max-w-xs rounded-md bg-zinc-800 p-2 text-sm italic text-zinc-400 md:block">
          {song.notes}
        </div>
      )}
      
      {(onAccept || onReject) && isHovered && (
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2">
          {onAccept && (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-700 bg-green-950/50 text-green-500 hover:bg-green-900/50 hover:text-green-400"
              onClick={() => onAccept(song)}
            >
              <Check className="mr-1 h-4 w-4" /> Accept
            </Button>
          )}
          
          {onReject && (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-700 bg-red-950/50 text-red-500 hover:bg-red-900/50 hover:text-red-400"
              onClick={() => onReject(song)}
            >
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          )}
        </div>
      )}
    </div>
  );
};