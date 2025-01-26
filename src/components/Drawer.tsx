'use client';
import { Drawer } from 'vaul';
import React from 'react';
import { MdLyrics } from 'react-icons/md';
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';
import { Divider } from './Divider';
import { SongType } from '@/lib/interface';
import Image from 'next/image';

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
        <EllipsisHorizontalIcon className={'w-6 h-6'} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-rosePine-base/80" />
        <Drawer.Title></Drawer.Title>
        <Drawer.Content className="bg-rosePine-base flex flex-col  border-t border-t-rosePine-highlightMed rounded-t-xl mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none z-40">
          <div className="p-2 bg-rosePine-highlightLow rounded-t-xl border-t border-t-rosePine-highlightMed flex-1">
            <div aria-hidden className="mx-auto w-28 h-[3px] flex-shrink-0 rounded-full bg-rosePine-highlightHigh mb-4" />
            <div className={'flex flex-row items-center gap-2 my-2'}>
              <Image src={song.artwork as string} alt={song.title} width={48} height={48} className={'w-12 h-12 m-1 p-1 ml-2'} />
              <div className={'flex flex-col justify-between'}>
                <div className={'text-sm font-bold'}>{song.title}</div>
                <div className={'text-xs'}>{song.artist}</div>
              </div>
            </div>
            <Divider className={'my-2'} />
            <div className={'flex flex-col ml-2 mt-2 gap-4 mb-6 w-full'}>
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
    <div className={'flex gap-4 items-center w-full'} onClick={() => onClick(song)}>
      {icon}
      <p className={'text-sm'}>{title}</p>
    </div>
  );
};
