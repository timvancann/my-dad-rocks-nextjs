'use client';
import { SongType } from '@/lib/interface';
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from 'react-icons/io';
import { MdLyrics } from 'react-icons/md';
import { Drawer } from 'vaul';
import { Divider } from './Divider';

type SongDetailDrawerProps = {
  song: SongType;
  removeFromSetlistFn?: (id: string) => void;
  addToSetlistFn?: (id: string) => void;
};
export const SongDetailDrawer = ({ song, removeFromSetlistFn, addToSetlistFn }: SongDetailDrawerProps) => {
  const router = useRouter();

  return (
    <Drawer.Root>
      <Drawer.Trigger>
        <EllipsisHorizontalIcon className={'h-6 w-6'} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-rosePine-base/80" />
        <Drawer.Title></Drawer.Title>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-40 mt-24 flex h-fit flex-col rounded-t-xl border-t border-t-rosePine-highlightMed bg-rosePine-base outline-none">
          <div className="flex-1 rounded-t-xl border-t border-t-rosePine-highlightMed bg-rosePine-highlightLow p-2">
            <div aria-hidden className="mx-auto mb-4 h-[3px] w-28 flex-shrink-0 rounded-full bg-rosePine-highlightHigh" />
            <div className={'my-2 flex flex-row items-center gap-2'}>
              <Image src={song.artwork as string} alt={song.title} width={48} height={48} className={'m-1 ml-2 h-12 w-12 p-1'} />
              <div className={'flex flex-col justify-between'}>
                <div className={'text-sm font-bold'}>{song.title}</div>
                <div className={'text-xs'}>{song.artist}</div>
              </div>
            </div>
            <Divider className={'my-2'} />
            <div className={'mb-6 ml-2 mt-2 flex w-full flex-col gap-4'}>
              <Button
                icon={<MdLyrics className={'h-6 w-6'} />}
                song={song}
                title={'Lyrics'}
                onClick={() => {
                  router.push(`/lyrics/${song._id}`);
                }}
              />
              {removeFromSetlistFn ? (
                <Button icon={<IoMdRemoveCircleOutline className={'h-6 w-6'} />} song={song} title={'Verwijder van playlist'} onClick={() => removeFromSetlistFn(song._id)} />
              ) : null}
              {addToSetlistFn ? <Button icon={<IoMdAddCircleOutline className={'h-6 w-6'} />} song={song} title={'Toevoegen aan playlist'} onClick={() => addToSetlistFn(song._id)} /> : null}
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
