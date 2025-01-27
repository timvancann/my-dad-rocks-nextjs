'use client';
import { Divider } from '@/components/Divider';
import { GigCard } from '@/components/GigCard';
import { SongsTitle } from '@/components/PlaylistTitle';
import { GigsType } from '@/lib/interface';
import Link from 'next/link';
import React from 'react';
import { IoMdAddCircle } from 'react-icons/io';

export default function GigList({ gigs }: { gigs: GigsType[] }) {
  const [edit, setEdit] = React.useState(false);
  return (
    <div className={'items-center justify-center text-rosePine-text'}>
      <SongsTitle title={'Optredens'} />
      {gigs.map((gig, index) => {
        return (
          <div key={index}>
            {index > 0 && <Divider />}
            <GigCard gig={gig} />
          </div>
        );
      })}

      <Link href={'/gigs/new'}>
        <button className={'absolute bottom-36 right-5 rounded-xl bg-rosePine-highlightLow p-2 drop-shadow-lg'} onClick={() => setEdit(true)}>
          <IoMdAddCircle className={'h-8 w-8 text-rosePine-love'} />
        </button>
      </Link>
    </div>
  );
}
