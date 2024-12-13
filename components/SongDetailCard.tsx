'use client';
import { SongType } from '@/lib/interface';
import React, { useEffect, useRef } from 'react';
import { updateSetlistSongs } from '@/actions/sanity';
import { AnimatePresence } from 'framer-motion';
import { usePlayerStore, useSongDetailStore } from '@/store/store';

type SongDetailCardProps = {
  song: SongType;
}

export const SongDetailCard = ({ song }: SongDetailCardProps) => {

  const setlist = usePlayerStore(state => state.setlist);
  const setSetlist = usePlayerStore(state => state.setSetlist);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  if (setlist === undefined)
    return null;

  const addSongToPlaylist = async (song: SongType) => {
    if (setlist.songs.includes(song)) {
      return;
    }
    const updatedList = [...setlist.songs, song];
    setlist.songs = updatedList;
    setSetlist(setlist);
    await updateSetlistSongs(updatedList, setlist._id);
  };

  const removeSongFromPlaylist = async (song: SongType) => {
    let updatedList = setlist.songs.filter((item) => item.title !== song.title);
    setlist.songs = updatedList;
    setSetlist(setlist);
    await updateSetlistSongs(updatedList, setlist._id);
  };

  return (
    <AnimatePresence>
      <div
        ref={wrapperRef}
        className={'fixed bottom-0 w-full flex-col bg-rosePine-highlightLow rounded-t-xl pt-5 px-2 h-60 z-40'}>
        <div className={'flex flex-row items-center gap-2'}>
          <img src={song.artwork} alt={song.title} className={'w-12 h-12 m-1 p-1 ml-2'} />
          <div className={'flex flex-col justify-between'}>
            <div className={'text-sm font-bold'}>{song.title}</div>
            <div className={'text-xs'}>{song.artist}</div>
          </div>

        </div>

      </div>
    </AnimatePresence>
  );
};

function useOutsideAlerter(ref: React.RefObject<HTMLDivElement>) {
  const setDetail = useSongDetailStore((state) => state.setSong);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setDetail(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
