'use client';

import { Setlist } from '@/components/Setlist';
import { AddSongModal } from '@/components/AddSongModal';
import { usePracticeStore } from '@/context/PracticeProvider';
import { useAddSetlistItem } from '@/hooks/convex';
import { SongType } from '@/lib/interface';
import { THEME } from '@/themes';
import type { Id } from '../../../../convex/_generated/dataModel';

export default function Home() {
  const store = usePracticeStore((state) => state);
  const addSetlistItem = useAddSetlistItem();
  const totalDuration = store.setlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const roundedDuration = Math.round(totalDuration / 60);

  const handleAddSongToSetlist = async (song: SongType) => {
    store.addSong(song);
    // Add item to Convex setlist
    if (store.setlist._id) {
      await addSetlistItem({
        setlistId: store.setlist._id as Id<'setlists'>,
        songId: song._id as Id<'songs'>,
        itemType: 'song',
        position: store.setlist.songs.length,
      });
    }
    // Don't close modal - let user continue adding songs
  };

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center">
          <h2 className={`text-lg font-bold ${THEME.primary} mr-2 uppercase tracking-wider`}>Oefenlijst</h2>
          {/* <div className={`rounded px-1.5 py-0.5 text-xs ${THEME.secondaryBg} font-medium text-zinc-900`}>ROCK</div> */}
        </div>
        <span className="text-xs text-gray-500">
          • {store.setlist.songs.length} songs • {roundedDuration} min
        </span>
      </div>
      
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
    </div>
  );
}
