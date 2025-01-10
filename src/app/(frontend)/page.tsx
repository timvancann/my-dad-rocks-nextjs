'use client';
import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Tracklist } from '@/components/Tracklist';
import { Setlist } from '@payload-types';
import { useQuery, gql } from '@apollo/client';

const GET_SETLISTS = gql`
  query {
    Setlists(where: { isPractice: { equals: true } }) {
      docs {
        id
        title
        isPractice
        items {
          id
          itemType
          track {
            id
            title
            artist
            coverart {
              thumbnailURL
              url
            }
            audio {
              url
            }
          }
        }
      }
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_SETLISTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const setlist = data.Setlists.docs[0] as Setlist;

  return (
    <div className="md:flex md:flex-col items-center justify-center mx-2">
      <SongsTitle title={setlist.title} />
      <Tracklist setlist={setlist} refetch={[GET_SETLISTS]} />
    </div>
  );
}
