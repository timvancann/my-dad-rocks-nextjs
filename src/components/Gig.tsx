'use client';

import { AddPause } from '@/components/AddPause';
import { Setlist } from '@/components/Setlist';
import { EditGig } from '@/components/EditGig';
import { AddSongModal } from '@/components/AddSongModal';
import GigProvider, { useGigStore } from '@/context/GigProvider';
import { usePracticeStore } from '@/context/PracticeProvider';
import { GigType, SongType } from '@/lib/interface';
import { updateSetlistSongs } from '@/actions/supabase';
import { THEME } from '@/themes';
import { ArrowLeft, Calendar, Clock, MapPin, Music, Edit } from 'lucide-react';
import { useState } from 'react';

type GigProps = {
  gig: GigType;
};
export const Gig = ({ gig }: GigProps) => {
  const allSongs = usePracticeStore((state) => state.allSongs);
  const [showEditForm, setShowEditForm] = useState(false);

  const songs = gig.setlist?.songs || [];
  const totalDuration = Math.round(songs.reduce((acc, song) => acc + (song.duration || 0), 0) / 60);
  const totalSongs = songs.length;

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };


  return (
    <>
      {showEditForm && <EditGig gig={gig} onClose={() => setShowEditForm(false)} />}
      <div className="flex flex-col">
        <header className="border-zinc-800/50 bg-zinc-950/95 bg-opacity-90 shadow-lg backdrop-blur-xl">
        {/* Top navigation bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <button className="rounded-full bg-zinc-800/70 p-1.5" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className={`text-xl font-bold ${THEME.primary}`}>Gig Details</h1>
          <button 
            onClick={() => setShowEditForm(true)}
            className="rounded-full bg-zinc-800/70 p-1.5 hover:bg-zinc-700 transition-colors"
            title="Bewerk gig"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {/* Gig information card */}
        <div className="mx-4 mb-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-md">
          <div className="flex items-start">
            {/* Left: Gig image */}
            <div className="mr-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-zinc-800">
                <Music className={`h-8 w-8 ${THEME.primary}`} />
              </div>
            </div>

            {/* Right: Gig details */}
            <div className="flex-1">
              <h2 className="text-lg font-bold">{gig.title}</h2>

              {/* Date and time */}
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Calendar className={`h-3.5 w-3.5 ${THEME.secondary}`} />
                <span className="text-gray-300">{formatDate(gig.date)}</span>
                <span className="mx-1 text-gray-500">•</span>
                <Clock className={`h-3.5 w-3.5 ${THEME.secondary}`} />
                <span className="text-gray-300">{gig.time}</span>
              </div>

              {/* Venue and address */}
              <div className="mt-1.5 flex items-start gap-1">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300">{gig.venue}</span>
                  <span className="text-xs text-gray-500">{gig.address}</span>
                </div>
              </div>

              {/* Setlist summary */}
              <div className="mt-1.5 flex items-center text-xs text-gray-400">
                <div className="flex items-center">
                  <Music className="mr-1 h-3.5 w-3.5" />
                  <span>{totalSongs} songs</span>
                </div>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  <span>{totalDuration} min</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes section */}
          {(gig as any).notes && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{(gig as any).notes}</p>
            </div>
          )}
        </div>
      </header>
      <div className="mb-3 flex items-center">
        <h2 className={`text-base font-bold ${THEME.primary} mr-2 uppercase tracking-wider`}>Setlist</h2>
      </div>
      <GigProvider setlist={gig.setlist} allSongs={allSongs}>
        <Content />
      </GigProvider>
    </div>
    </>
  );
};

const Content = () => {
  const store = useGigStore((state) => state);

  const handleAddSongToSetlist = async (song: SongType) => {
    store.addSong(song);
    await updateSetlistSongs(store.setlist._id, [...store.setlist.songs, song]);
    // Don't close modal - let user continue adding songs
  };

  return (
    <>
      <Setlist 
        setlist={store.setlist} 
        removeSong={store.removeSong} 
        updateSongsInSetlist={store.updateSongsInSetlist}
        onAddSong={store.openAddSongModal}
      />
      
      <AddSongModal
        isOpen={store.isAddSongModalOpen}
        onClose={store.closeAddSongModal}
        availableSongs={store.allSongs}
        excludeSongs={store.setlist.songs}
        onAddSong={handleAddSongToSetlist}
      />
      
      <div className="flex justify-end">
        <AddPause addSong={store.addSong} setlist={store.setlist} />
      </div>
    </>
  );
};
