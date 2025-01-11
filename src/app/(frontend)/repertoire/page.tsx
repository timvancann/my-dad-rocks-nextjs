'use client';
import React from 'react';
import { Track } from '@payload-types';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Divider } from '@/components/Divider';
import { TrackCard } from '@/components/TrackCard';
import { useQuery, gql, useMutation } from '@apollo/client';
import { UPDATE_SETLISTS } from '@/queries/updateSetlist';
import { SetlistItem } from '@/components/Tracklist';

const GET_TRACKS = gql`
  query {
    Tracks {
      docs {
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
    Setlists(where: { isPractice: { equals: true } }) {
      docs {
        id
        items {
          id
          itemType
          track {
            id
          }
        }
      }
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_TRACKS);
  const [updateSetlist] = useMutation(UPDATE_SETLISTS, {
    refetchQueries: [UPDATE_SETLISTS]
  })

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const tracks = data.Tracks.docs as Track[];

  const alreadyExists = (track: Track): boolean => {
    return (data.Setlists.docs[0].items as SetlistItem[])
      .filter((item) => item.itemType === 'track')
      .map((item) => item.track.id)
      .includes(track.id);
  }

  const addToSetlist = (track: Track) => {
    if (alreadyExists(track)) return;

    const items: {
      id?: string;
      itemType: 'track' | 'break';
      track?: number;
    }[] = (data.Setlists.docs[0].items as SetlistItem[]).map((item) => {
      return { id: item.id, itemType: item.itemType };
    });
    items.push({ itemType: 'track', track: track.id });
    updateSetlist({ variables: { id: data.Setlists.docs[0].id, items: items } });
  };


  return (
    <div className={'text-rosePine-text items-center justify-center mx-2'}>
      <div>
        <SongsTitle title={'Repertoire'} />
      </div>
      {tracks.map((item, index) => (
        <div key={index}>
          {index > 0 && <Divider />}
          {alreadyExists(item) && <TrackCard
            track={item}
            playlist={tracks}
          />
          }
          {!alreadyExists(item) && <TrackCard
            track={item}
            playlist={tracks}
            addToSetlist={() => {
              addToSetlist(item);
            }}
          />
          }
        </div>
      ))}
    </div>
  );
}
