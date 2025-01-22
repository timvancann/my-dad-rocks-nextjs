import React from 'react';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/16/solid';
import { Gig } from '@payload-types';
import { parseISO, format } from 'date-fns';

type GigCardProps = {
  gig: Gig;
};
export const GigCard = ({ gig }: GigCardProps) => {
  const date = parseISO(gig.date as string);

  return (
    <Link href={`/gigs/${gig.id}`} className={'cursor-pointer'}>
      <div className={`flex flex-col grow gap-1 px-3 py-2 rounded-xl`}>
        <div className={'flex flex-row gap-4 items-center'}>
          <CalendarIcon className={'text-rosePine-gold h-8 w-8'} />
          <div className={'mr-6'}>
            <h1 className={'text-rosePine-text font-bold'}>{gig.title}</h1>
            <time className={`text-sm text-rosePine-text font-normal`} dateTime={gig.date as string}>
              {format(date, 'd LLLL, yyyy')}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
};
