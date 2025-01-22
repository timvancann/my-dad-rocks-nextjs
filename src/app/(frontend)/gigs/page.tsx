'use client';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Gig } from '@payload-types';
import { SongsTitle } from '@/components/PlaylistTitle';
import { GigCard } from '@/components/GigCard';
import Link from 'next/link';
import { IoAddCircle } from 'react-icons/io5';
import { Divider } from '@/components/Divider';
import { GET_GIGS } from '@/queries/getGigs';

export default function Home() {
  const { loading, error, data } = useQuery(GET_GIGS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const gigs = data.Gigs.docs as Gig[];

  return (
    <div className="md:flex md:flex-col items-center justify-center mx-2">
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
          <button className={'absolute right-5 bottom-36 bg-rosePine-highlightLow rounded-xl p-2 drop-shadow-lg'}>
            <IoAddCircle className={'h-8 w-8 text-rosePine-love'} />
          </button>
        </Link>
      </div>
    </div>
  );
}
