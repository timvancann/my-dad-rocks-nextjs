'use client';

import React, { useState } from 'react';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import {
  PayloadLexicalReactRenderer,
  PayloadLexicalReactRendererContent,
} from "@atelier-disko/payload-lexical-react-renderer";


import { Poppins } from 'next/font/google';
import { Track } from '@payload-types';
import { motion } from 'motion/react';

const font = Poppins({ subsets: ['latin'], weight: '300' });

export default function DisplayLyrics({ song }: { song: Track }) {
  const [textSize, setTextSize] = useState(1);

  return (
    <div className={'justify-center items-center flex flex-col my-4'}>
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
      <div className={`text-rosePine-text mx-4 whitespace-pre-line prose ${font.className}`} style={{ fontSize: `${textSize}em` }}>
        {song.lyrics &&
          <PayloadLexicalReactRenderer content={song.lyrics as PayloadLexicalReactRendererContent} />
        }
        {!song.lyrics && <p>Geen lyrics gevonden</p>}
      </div>
    </div>
  );
}
