'use client'
import DisplayLyrics from '@/components/Lyrics';
import { gql, useQuery } from '@apollo/client';
import { Track } from '@payload-types';
import React from 'react';

const GET_LYRICS = gql`
  query Track($trackId: Int!){
    Track(id: $trackId) {
        lyrics
        title
        artist
    }
  }
`

export default function Lyrics(props: { params: Promise<{ song_id: string }> }) {
  const params = React.use(props.params);

  const { loading, error, data } = useQuery(GET_LYRICS, {
    variables: {
      trackId: parseInt(params.song_id)
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const track: Track = data.Track;
  console.log(track)


  return <DisplayLyrics song={track} />;
}
