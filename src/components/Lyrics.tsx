'use client';

import { modifyLyrics } from '@/actions/sanity';
import { LyricType } from '@/lib/sanity';
import { useState } from 'react';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';

import { motion } from 'motion/react';
import { Poppins } from 'next/font/google';

const font = Poppins({ subsets: ['latin'], weight: '300' });

export default function DisplayLyrics({ song, songId }: { song: LyricType; songId: string }) {
  const [edit, setEdit] = useState(false);
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [textSize, setTextSize] = useState(1);

  return (
    <div className={'my-4 flex flex-col items-center justify-center'}>
      <h1 className={'flex text-lg font-bold tracking-widest text-rosePine-text'}>
        {song.artist} - {song.title}
      </h1>
      <div className={'my-4 flex flex-row gap-8'}>
        <motion.button className={'text-3xl'} onClick={() => setTextSize(textSize + 0.2)}>
          <FaPlusCircle />
        </motion.button>
        <motion.button className={'text-3xl'} onClick={() => setTextSize(textSize - 0.2)}>
          <FaMinusCircle />
        </motion.button>
      </div>
      {!edit && (
        <div className={`prose mx-4 whitespace-pre-line text-rosePine-text ${font.className}`} style={{ fontSize: `${textSize}em` }}>
          {lyrics || 'No lyrics found'}
        </div>
      )}
      {edit && (
        <div className="flew flex-col">
          <textarea value={lyrics ?? ''} onChange={(e) => setLyrics(e.target.value)} cols={50} rows={30} />
          <div>
            <button
              className={'mx-auto mt-2 rounded-md bg-rosePine-gold p-1 px-2 text-rosePine-base'}
              onClick={async () => {
                await modifyLyrics(songId, lyrics);
                setEdit(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
      <button className={'mx-auto mt-2 rounded-md bg-rosePine-rose p-1 px-2 text-rosePine-base'} onClick={() => setEdit(!edit)}>
        {edit ? 'Cancel' : 'Edit'}
      </button>
    </div>
  );
}
