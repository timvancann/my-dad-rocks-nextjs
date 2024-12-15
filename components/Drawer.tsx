'use client';
import { Drawer } from 'vaul';
import { SetlistType, SongType } from '@/lib/interface';
import React, { useEffect, useState } from 'react';
import { EllipsisVerticalIcon } from '@sanity/icons';
import { MdLyrics } from 'react-icons/md';
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { updateSetlistSongs } from '@/actions/sanity';

type SongDetailDrawerProps = {
  song: SongType,
  setSetlist: (setlist: SetlistType) => void
  setlist?: SetlistType
};
export const SongDetailDrawer = ({ song, setlist, setSetlist }: SongDetailDrawerProps) => {
  const router = useRouter();

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
    setSetlist({ ...setlist, songs: updatedList });
    await updateSetlistSongs(updatedList, setlist._id);
  };

  const removeSongFromPlaylist = async (song: SongType) => {
    let updatedList = setlist.songs.filter((item) => item.title !== song.title);
    setSetlist({ ...setlist, songs: updatedList });
    await updateSetlistSongs(updatedList, setlist._id);
  };
  return (
    <Drawer.Root>
      <Drawer.Trigger>
        <EllipsisVerticalIcon className={'w-6 h-6'} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-rosePine-base/80" />
        <Drawer.Title></Drawer.Title>
        <Drawer.Content
          className="bg-rosePine-base flex flex-col  border-t border-t-rosePine-highlightMed rounded-t-xl mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none">
          <div className="p-2 bg-rosePine-highlightLow rounded-t-xl border-t border-t-rosePine-highlightMed flex-1">
            <div aria-hidden
                 className="mx-auto w-28 h-[3px] flex-shrink-0 rounded-full bg-rosePine-highlightHigh mb-4" />
            <div className={'flex flex-row items-center gap-2 my-2'}>
              <img src={song.artwork} alt={song.title} className={'w-12 h-12 m-1 p-1 ml-2'} />
              <div className={'flex flex-col justify-between'}>
                <div className={'text-sm font-bold'}>{song.title}</div>
                <div className={'text-xs'}>{song.artist}</div>
              </div>
            </div>
            <Drawer.Close>
              <div className={'flex flex-col ml-2 mt-2 gap-4 mb-6'}>
                <Button icon={<MdLyrics className={'h-6 w-6'} />}
                        song={song}
                        title={'Lyrics'}
                        setlist={setlist}
                        onClick={() => {
                          router.push(`/lyrics/${song.id}`);
                        }} />
                {songInPlaylist ?
                  <Button icon={<IoMdRemoveCircleOutline className={'h-6 w-6'} />}
                          song={song}
                          title={'Verwijder van playlist'}
                          setlist={setlist}
                          onClick={() => {
                            removeSongFromPlaylist(song);

                          }} />
                  :
                  <Button icon={<IoMdAddCircleOutline className={'h-6 w-6'} />}
                          song={song}
                          title={'Toevoegen aan playlist'}
                          setlist={setlist}
                          onClick={() => {
                            addSongToPlaylist(song);
                          }} />
                }
              </div>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
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
