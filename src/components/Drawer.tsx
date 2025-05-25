'use client';
import { SongType } from '@/lib/interface';
import { CirclePlus, FileText, Info, MoreHorizontal, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Drawer } from 'vaul';
import { Divider } from './Divider';
import { TbListDetails } from 'react-icons/tb';

type SongDetailDrawerProps = {
  song: SongType;
  removeFromSetlistFn?: (id: string) => void;
  addToSetlistFn?: (id: string) => void;
  setShowNotes: () => void;
};
export const SongDetailDrawer = ({ song, removeFromSetlistFn, addToSetlistFn, setShowNotes }: SongDetailDrawerProps) => {
  const router = useRouter();

  return (
    <Drawer.Root>
      <Drawer.Trigger>
        <MoreHorizontal className={'h-5 w-5'} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-zinc-900/90" />
        <Drawer.Title></Drawer.Title>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-40 mt-24 flex h-fit flex-col outline-none">
          <div className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 p-2 shadow-lg">
            <div aria-hidden className="mx-auto mb-2 h-[2px] w-28 flex-shrink-0 rounded-full bg-zinc-700" />
            <div className={'flex flex-row items-center gap-2'}>
              <Image src={song.artwork as string} alt={song.title} width={48} height={48} className={'m-1 ml-2 h-12 w-12 rounded-lg p-1'} />
              <div className={'flex flex-col justify-between'}>
                <div className={'text-sm font-bold'}>{song.title}</div>
                <div className={'text-xs'}>{song.artist}</div>
              </div>
            </div>
            <Divider className={'my-1'} />
            <div className={'m-2 flex w-full flex-col gap-4'}>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-700" onClick={() => router.push(`/practice/lyrics/${song._id}`)}>
                <FileText className="h-4 w-4 text-amber-400" /> Lyrics
              </button>

              {/* Notes toggle option */}
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-700"
                onClick={() => {
                  router.push(`/practice/song/${song._id}`);
                }}
              >
                <TbListDetails className="h-4 w-4 text-amber-400" /> Details
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-700"
                onClick={setShowNotes}
              >
                <Info className="h-4 w-4 text-amber-400" /> Notities
              </button>
              {removeFromSetlistFn && (
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-800/40" onClick={() => removeFromSetlistFn(song._id)}>
                  <Trash2 className="h-4 w-4" /> Verwijder uit setlist
                </button>
              )}
              {addToSetlistFn && (
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-400 hover:bg-amber-800/40" onClick={() => addToSetlistFn(song._id)}>
                  <CirclePlus className="h-4 w-4" /> Toevoegen aan setlist
                </button>
              )}
            </div>
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
  onClick: (song: SongType) => void;
};
const Button = ({ icon, onClick, song, title }: ButtonProps) => {
  return (
    <button className={'flex w-full items-center gap-4'} onClick={() => onClick(song)}>
      {icon}
      <p className={'text-sm'}>{title}</p>
    </button>
  );
};
