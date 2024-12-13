import React from 'react';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/16/solid';
import { GigsType } from '@/lib/interface';

type GigCardProps = {
  gig: GigsType;
}
export const GigCard = ({ gig }: GigCardProps) => {
  return (
    <Link href={`/gigs/${gig._id}`} className={'cursor-pointer'}>
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
