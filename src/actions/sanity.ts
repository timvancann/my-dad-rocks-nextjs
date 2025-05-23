'use server';

import { GigType, SetlistType, SongType } from '@/lib/interface';
import { createClient, SanityDocumentStub } from 'next-sanity';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function removeSongFromSetlist(setlist: SetlistType, song: SongType) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  const filteredSongs = setlist.songs.filter((s) => s._id !== song._id);

  return await client
    .patch(setlist._id)
    .set({
      songs: filteredSongs.map((song) => ({ _type: 'reference', _ref: song._id, _key: song._id }))
    })
    .commit()
    .then((state) => {
      return {
        message: 'Successfully updated the setlist',
        payload: state
      };
    })
    .catch((err) => {
      return {
        message: 'Oh no, the update failed',
        payload: err
      };
    });
}

export async function updateSetlistSongs(reorderedSongs: SongType[], setlistId: string) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  return await client
    .patch(setlistId)
    .set({
      songs: reorderedSongs.map((song) => ({ _type: 'reference', _ref: song._id, _key: song._id }))
    })
    .commit();
}

export type FormDataState = {
  message?: string;
  songs: SongType[];
};

export async function addPause(pause: SongType, setlist: SetlistType) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  await client.create(pause as SanityDocumentStub);
  const updatedSongs = [...setlist.songs, pause];
  await updateSetlistSongs(updatedSongs, setlist._id);
}

export async function removePause(id: string, setlistId: string) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  await client.delete(id);

  const setlist = await getSetlist(setlistId);
  return {
    message: 'Successfully updated playlist',
    songs: setlist.songs
  };
}

async function getSetlist(id: string) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  const qry = `
   *[_type == "setlist" && _id == "${id}"]{
   _id,
     title,
    "songs": songs[]->{ 
    _id,
    "id": _id,
    title,
    artist,
    cover_art,
    audio{
      asset->{
      _id,
      url
    }},
    last_played_at    },
 }[0]
  `;
  return await client.fetch<SetlistType>(qry, {}, { cache: 'no-store' });
}

export async function removePauseFromPlaylist(previousState: SongType[], form: FormData) {
  const setlistId = form.get('setlistId') as string;
  const songId = form.get('songId') as string;

  const updatedList = previousState.filter((song) => song._id !== songId);

  await updateSetlistSongs(updatedList, setlistId);
  await removePause(songId, setlistId);
  return updatedList;
}

export async function modifyLyrics(songId: string, lyrics: string) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  await client.patch(songId).set({ lyrics: lyrics }).commit();
}

export async function createGig(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const date = formData.get('date') as string;

  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  await client
    .create({
      _type: 'setlist',
      title: title,
      songs: []
    })
    .then(async (data) => {
      await client.create({
        _type: 'gig',
        title: title,
        date: date,
        setlist: {
          _type: 'reference',
          _ref: data._id
        }
      });
    });

  revalidatePath('/practice/gigs');
  return {
    success: true
  };
}

export async function removeGig(gig: GigType) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN
  });

  await client.delete(gig._id);
  await client.delete(gig.setlist._id);
  redirect('/practice/gigs');
}
