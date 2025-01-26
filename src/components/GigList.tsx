'use client';
import { GigsType } from '@/lib/interface';
import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Divider } from '@/components/Divider';
import { GigCard } from '@/components/GigCard';
import Link from 'next/link';
import { IoMdAddCircle } from 'react-icons/io';

export default function GigList({ gigs }: { gigs: GigsType[] }) {
  const [edit, setEdit] = React.useState(false);
  return (
    <div className={'text-rosePine-text items-center justify-center'}>
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
        <button className={'absolute right-5 bottom-36 bg-rosePine-highlightLow rounded-xl p-2 drop-shadow-lg'}
          onClick={() => setEdit(true)}>
          <IoMdAddCircle className={'h-8 w-8 text-rosePine-love'} />
        </button>
      </Link>
    </div>
  );
}
