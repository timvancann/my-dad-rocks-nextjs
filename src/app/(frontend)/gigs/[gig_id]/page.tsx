'use client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Gig, Setlist, Track } from '@payload-types';
import { SetlistItem, Tracklist } from '@/components/Tracklist';
import { UPDATE_SETLISTS } from '@/queries/updateSetlist';
import React, { useEffect, useState } from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { TrackCard } from '@/components/TrackCard';
import { Divider } from '@/components/Divider';
import { PendingIcon } from '@/components/PendingIcon';
import { MdAdd } from 'react-icons/md';

const GET_GIG = gql`
query Gig($id: Int!) {
    Gig(id: $id) {
        id
        title
        date
        location
        googleMapsUrl
        setlist {
            id
            title
            isPractice
            items {
                itemType
                notes
                id
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
    Tracks {
        docs {
            id
            title
            artist
            coverart {
                url
                thumbnailURL
            }
            audio {
                url
            }
        }
    }
}
`
  ;

export default function Page(props: { params: Promise<{ gig_id: string }> }) {
  const params = React.use(props.params);

  const { loading, error, data } = useQuery(GET_GIG, {
    variables: {
      id: parseInt(params.gig_id)
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const gig: Gig = data.Gig;

  return (
    <div className="md:flex md:flex-col items-center justify-center mx-2">
      <SongsTitle title={gig.title as string} />
      <Tracklist setlist={gig.setlist as Setlist} refetch={[GET_GIG]} />
      <AddPauseButton setlist={gig.setlist as Setlist} />
      <TrackList setlist={gig.setlist as Setlist} allTracks={data.Tracks.docs} />
    </div>
  )
}


type TrackListProps = {
  setlist: Setlist,
  allTracks?: Track[],
}

const TrackList = ({ setlist, allTracks }: TrackListProps) => {
  const [tracks, setTracks] = useState<Track[]>([])
  const [updateSetlist, { loading }] = useMutation(UPDATE_SETLISTS, {
    refetchQueries: [
      GET_GIG
    ]
  })


  useEffect(() => {
    if (!setlist) return
    if (!allTracks) return

    const gigSongs: Track[] = (setlist.items ?? [])
      .filter((item) => item.itemType === "track")
      .map(item => item.track as Track)

    const selectedTracks = (allTracks)
      .filter((track: Track) => !gigSongs.some(t => {
        const value = t.id === track.id
        return value
      })
      )
    setTracks(selectedTracks)

  }, [allTracks, setlist])

  const addToSetlist = (track: Track) => {
    const newList = appendTrackToList(track, setlist);
    if (!newList) return;

    updateSetlist({ variables: { id: setlist.id, items: newList } });
  };


  return (
    <>
      {loading && <p>Loading...</p>}
      <SongsTitle title={"Overige nummers"} />
      {tracks.map((item, index) => (
        <div key={index}>
          {index > 0 && <Divider />}
          <TrackCard
            track={item}
            playlist={tracks}
            addToSetlist={() => {
              addToSetlist(item);
            }}
          />
        </div>
      ))}
    </>
  )
}

const appendPauseToList = (setlist: Setlist): { id?: string, itemType: "track" | "break", track?: number }[] => {
  const items: {
    id?: string;
    itemType: 'track' | 'break';
    track?: number;
  }[] = (setlist.items as SetlistItem[]).map((item) => {
    return { id: item.id, itemType: item.itemType };
  });
  items.push({ itemType: 'break' });

  return items;
}

const appendTrackToList = (track: Track, setlist: Setlist): { id?: string, itemType: "track" | "break", track?: number }[] | null => {
  const alreadyExists = (setlist.items as SetlistItem[])
    .filter((item) => item.itemType === 'track')
    .map((item) => item.track.id)
    .includes(track.id);

  if (alreadyExists) return null;


  const items: {
    id?: string;
    itemType: 'track' | 'break';
    track?: number;
  }[] = (setlist.items as SetlistItem[]).map((item) => {
    return { id: item.id, itemType: item.itemType };
  });
  items.push({ itemType: 'track', track: track.id });

  return items;
};



const AddPauseButton = ({ setlist }: TrackListProps) => {
  const [updateSetlist, { loading }] = useMutation(UPDATE_SETLISTS, {
    refetchQueries: [
      GET_GIG
    ]
  })

  const addToSetlist = () => {
    const newList = appendPauseToList(setlist);
    if (!newList) return;

    updateSetlist({ variables: { id: setlist.id, items: newList } });
  };


  return (
    <button onClick={() => addToSetlist()} disabled={loading} className={`flex bg-rosePine-base rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed mb-4`}>
      {loading ? (
        <PendingIcon />
      ) : (
        <>
          <span className={'text-xs'}>Pauze</span>
          <MdAdd className={'h-6 w-6 text-rosePine-love'} />
        </>
      )}
    </button>
  );
}
