import { GigsType } from '@/lib/interface';
import React from 'react';
import { CalendarIcon } from '@heroicons/react/16/solid';
import { SongsTitle } from '@/components/PlaylistTitle';
import { SongCardDivider } from '@/components/SongCardDivider';
import Link from 'next/link';

export default function Gigs({ gigs }: { gigs: GigsType[] }) {
  return (
    <div className={'text-rosePine-text items-center justify-center'}>
      <SongsTitle title={'Optredens'} />
      {gigs.map((gig, index) => {
        return (
          <div key={index}>
            {index > 0 && <SongCardDivider />}
            <GigCard gig={gig} />
          </div>
        );
      })}
    </div>
  );
}

const GigCard = ({ gig }: { gig: GigsType }) => {
  return (
    <Link href={`/gigs/${gig._id}`} className={"cursor-pointer"}>
      <div
        className={`flex flex-col grow gap-1 px-3 py-2 rounded-xl`}>
        <div className={'flex flex-row gap-4 items-center'}>
          <CalendarIcon className={'text-rosePine-gold h-8 w-8'} />
          <div className={'mr-6'}>
            <h1 className={'text-rosePine-text font-bold'}>{gig.title}</h1>
            <h2 className={`text-sm text-rosePine-text font-normal`}>{gig.date}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
};
