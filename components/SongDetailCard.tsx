'use client';

import { SetlistType, SongType } from '@/lib/interface';
import React, { useEffect, useRef, useState } from 'react';
import { updateSetlistSongs } from '@/actions/sanity';
import { AnimatePresence } from 'framer-motion';
import { useSongDetailStore } from '@/store/store';
import { RemoveCircleIcon } from '@sanity/icons';
import { SongCardDivider } from '@/components/SongCardDivider';
import { MdLyrics } from 'react-icons/md';
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from 'react-icons/io';
import { useRouter } from 'next/navigation'

type SongDetailCardProps = {
  song: SongType;
}

export const SongDetailCard = ({ song }: SongDetailCardProps) => {
  const router = useRouter()
  const setlist = useSongDetailStore(state => state.setlist);
  const setSong = useSongDetailStore(state => state.setSong);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const [songInPlaylist, setSongInPlaylist] = useState(false);

  useEffect(() => {
    if (!setlist || !song) return;
    setSongInPlaylist(setlist?.songs.map((item) => item._id).includes(song._id));
  }, [setlist, song]);

  if (!setlist || !song) return null;

  const addSongToPlaylist = async (song: SongType) => {
    if (setlist.songs.includes(song)) {
      return;
    }
    const updatedList = [...setlist.songs, song];
    setlist.songs = updatedList;
    await updateSetlistSongs(updatedList, setlist._id);
  };

  const removeSongFromPlaylist = async (song: SongType) => {
    let updatedList = setlist.songs.filter((item) => item.title !== song.title);
    setlist.songs = updatedList;
    await updateSetlistSongs(updatedList, setlist._id);
  };

  return (
    <AnimatePresence>
      <div
        ref={wrapperRef}
        className={'fixed bottom-0 w-full flex-col bg-rosePine-highlightLow rounded-t-xl px-2 border-t border-t-rosePine-highlightMed z-40'}>
        <div className={'flex flex-row items-center gap-2 my-2'}>
          <img src={song.artwork} alt={song.title} className={'w-12 h-12 m-1 p-1 ml-2'} />
          <div className={'flex flex-col justify-between'}>
            <div className={'text-sm font-bold'}>{song.title}</div>
            <div className={'text-xs'}>{song.artist}</div>
          </div>
        </div>
        <SongCardDivider />
        <div className={'flex flex-col ml-2 mt-2 gap-4 mb-6'}>
          <Button icon={<MdLyrics className={'h-6 w-6'} />}
                  song={song}
                  title={'Lyrics'}
                  setlist={setlist}
                  onClick={() => {
                    setSong(null)
                    router.push(`/lyrics/${song.id}`);
                  }} />
          {songInPlaylist ?
            <Button icon={<IoMdRemoveCircleOutline className={'h-6 w-6'} />}
                    song={song}
                    title={'Verwijder van playlist'}
                    setlist={setlist}
                    onClick={() => {
                    }} />
            :
            <Button icon={<IoMdAddCircleOutline className={'h-6 w-6'} />}
                    song={song}
                    title={'Toevoegen aan playlist'}
                    setlist={setlist}
                    onClick={() => {
                    }} />
          }
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

const RemoveFromPlaylistButton = ({ song }: { song: SongType }) => {
  return (
    <div className={'flex gap-2 items-center'}>
      <RemoveCircleIcon className={'h-6 w-6'} />
      <p className={'text-sm'}>Verwijder van playlist</p>
    </div>
  );
};

const AddToPlaylistButton = ({ song }: { song: SongType }) => {
  return (
    <div className={'flex gap-2 items-center'}>
      <RemoveCircleIcon className={'h-6 w-6'} />
      <p className={'text-sm'}>Verwijder van playlist</p>
    </div>
  );
};

type ButtonProps = {
  icon: React.ReactNode;
  song: SongType;
  title: string;
  setlist: SetlistType;
  onClick: (song: SongType, setlist: SetlistType) => void;
}
const Button = ({ icon, onClick, song, setlist, title }: ButtonProps) => {
  return (
    <div className={'flex gap-4 items-center'} onClick={() => onClick(song, setlist)}>
      {icon}
      <p className={'text-sm'}>{title}</p>
    </div>
  );
};
