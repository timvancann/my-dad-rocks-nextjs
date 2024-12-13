'use client';

import { modifyLyrics } from '@/actions/sanity';
import React, { useRef, useState } from 'react';
import { LyricType } from '@/lib/sanity';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import { motion, useScroll } from 'framer-motion';

import { Poppins } from 'next/font/google';

const font = Poppins({ subsets: ['latin'], weight: '300' });

export default function DisplayLyrics({ song, songId }: { song: LyricType; songId: string }) {
  const [edit, setEdit] = useState(false);
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [textSize, setTextSize] = useState(1);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end']
  });

  return (
    <div className={'justify-center items-center flex flex-col my-4'}>
      <motion.div className={'flex h-[4px] bg-rosePine-rose sticky top-0 w-full rounded-r-full'} style={{ scaleX: scrollYProgress, originX: 0 }} />
      <h1 className={'flex text-lg tracking-widest font-bold text-rosePine-text'}>
        {song.artist} - {song.title}
      </h1>
      <div className={'flex flex-row gap-8 my-4'}>
        <motion.button className={'text-3xl'} onClick={() => setTextSize(textSize + 0.2)}>
          <FaPlusCircle />
        </motion.button>
        <motion.button className={'text-3xl'} onClick={() => setTextSize(textSize - 0.2)}>
          <FaMinusCircle />
        </motion.button>
      </div>
      {!edit && (
        <div className={`text-rosePine-text mx-4 whitespace-pre-line prose ${font.className}`} style={{ fontSize: `${textSize}em` }} ref={ref}>
          {lyrics || 'No lyrics found'}
        </div>
      )}
      {edit && (
        <div className="flew flex-col">
          <textarea value={lyrics ?? ''} onChange={(e) => setLyrics(e.target.value)} cols={50} rows={30} />
          <div>
            <button
              className={'mx-auto bg-rosePine-gold text-rosePine-base rounded-md p-1 px-2 mt-2'}
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
      <button className={'mx-auto bg-rosePine-rose text-rosePine-base rounded-md p-1 px-2 mt-2'} onClick={() => setEdit(!edit)}>
        {edit ? 'Cancel' : 'Edit'}
      </button>
    </div>
  );
}
