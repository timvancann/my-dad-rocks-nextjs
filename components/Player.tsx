'use client';

import React, { ReactNode } from 'react';
import { useSelectedSongContext } from '@/context/selected-song-context';
import {
  MediaController,
  MediaControlBar,
  MediaSeekBackwardButton,
  MediaPlayButton,
  MediaSeekForwardButton,
  MediaTimeRange,
  MediaDurationDisplay,
  MediaTimeDisplay
} from 'media-chrome/react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/16/solid';
import { CloseCircleIcon } from '@sanity/icons';
import { usePlaylistContext } from '@/context/playlist-context';

const PropSpan = ({ children, slot }: { children: ReactNode; slot: string }) => {
  return <span slot={slot}>{children}</span>;
};

export const Player = () => {
  const { selectedSong, setSelectedSong } = useSelectedSongContext();
  const { playlist, allSongs } = usePlaylistContext();

  if (!selectedSong) {
    return <div></div>;
  }

  return (
    <div
      className={`fixed  bottom-20 w-full md:w-[60%] bg-rosePine-base bg-opacity-50 backdrop-blur-2xl backdrop-filter rounded-2xl border-y-2 border-y-rosePine-highlightMed z-20`}
    >
    <MediaController
      classname={'bg-transparent w-full'}
      audio>
      <audio
        slot="media"
        src={selectedSong.audio}
        autoPlay
        onEnded={() => {
          // select next song in playlist if current is in playlist
          let currentIndex = playlist.findIndex((song) => song.title === selectedSong.title);
          let nextIndex = (currentIndex + 1) % playlist.length;
          let list = playlist;

          if (currentIndex === -1) {
            let index = allSongs.findIndex((song) => song.title === selectedSong.title);
            if (index === -1) {
              return;
            }
            currentIndex = index;
            nextIndex = (currentIndex + 1) % allSongs.length;
            list = allSongs;
          }
          setSelectedSong(list[nextIndex]);
        }}
      ></audio>
      <MediaControlBar className={`block `}>
        <div className={`flex flex-col gap-1`}>
          <div
            className={'flex  text-rosePine-gold mx-6 tracking-wide h-16 mt-2'}>
            <div className={'grow'}>
              <img src={selectedSong.artwork} alt={selectedSong.title}
                   className={'w-16 h-16 drop-shadow-lg rounded-md'} />
            </div>
            <div className={'flex flex-col h-full mt-6 gap-4'}>
              <div className={'text-right font-semibold'}>{selectedSong.title}</div>
              <div className={'text-right text-xs'}>{selectedSong.artist}</div>
            </div>
          </div>
          <div className={'flex items-center gap-16 mx-auto'}>
            <button className={''} onClick={() => setSelectedSong(null)}>
              <CloseCircleIcon className={'w-12 h-12'} />
            </button>
            <div className={'grow flex items-center gap-1'}>
            <MediaSeekBackwardButton className={'bg-transparent'}>
              <PropSpan slot={'icon'}>
                {' '}
                <ArrowUturnLeftIcon className={'w-10 h-10 p-1'} />
              </PropSpan>
            </MediaSeekBackwardButton>
            <MediaPlayButton className={'bg-transparent'}>
              <PropSpan slot={'play'}>
                <PlayCircleIcon className={'w-20 h-20'} />
              </PropSpan>
              <PropSpan slot={'pause'}>
                <PauseCircleIcon className={'w-20 h-20'} />
              </PropSpan>
            </MediaPlayButton>
            <MediaSeekForwardButton className={'bg-transparent'}>
              <PropSpan slot={'icon'}>
                {' '}
                <ArrowUturnRightIcon className={'w-10 h-10 p-1'} />
              </PropSpan>
            </MediaSeekForwardButton>
            </div>
          </div>
          <div className={'flex flex-row items-center justify-center'}>
            <MediaTimeDisplay
              className={'text-rosePine-gold bg-transparent text-xs tracking-widest'}></MediaTimeDisplay>
            <MediaTimeRange className={`grow bg-transparent`}></MediaTimeRange>
            <MediaDurationDisplay
              className={`text-rosePine-gold bg-transparent text-xs tracking-widest`}></MediaDurationDisplay>
          </div>
        </div>
      </MediaControlBar>
    </MediaController>
    </div>
  )
    ;
};
