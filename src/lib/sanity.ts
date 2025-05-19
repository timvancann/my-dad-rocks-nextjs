import { GigsType, GigType, SetlistType, SongType } from '@/lib/interface';
import { createClient } from 'next-sanity';

const client = createClient({
  apiVersion: 'v2022-03-07',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true
});

export async function getAllSongs(): Promise<SongType[]> {
  const qry = `
  *[_type == "song"]|order(title){
    _id,
    title,
    artist,
    "artwork": cover_art.asset->url,
    "audio": audio.asset->url,
    last_played_at,
    dualGuitar,
    dualVocal,
    notes,
    duration,
    version
  }`;
  return await client.fetch<SongType[]>(qry, {}, { cache: 'no-store' });
}

export async function getSetlist(title: string): Promise<SetlistType> {
  const qry = `
   *[_type == "setlist" && title == "${title}"]{
   _id,
     title,
    "songs": songs[]->{ 
    _id,
    title,
    artist,
    "artwork": cover_art.asset->url,
    "audio": audio.asset->url,
    last_played_at,
    dualGuitar,
    dualVocal,
    notes,
    duration,
    version
 }}[0]
  `;
  return client.fetch<SetlistType>(qry, {}, { cache: 'no-store' });
}

export async function getLyrics(id: string) {
  const qry = `
*[_type == "song" && _id == "${id}"][0]{
  title, artist, lyrics
  }`;
  return await client.fetch<LyricType>(qry, {}, { cache: 'no-store' });
}

export type LyricType = {
  title: string;
  artist: string;
  lyrics: string;
};

export async function getGigs() {
  const qry = `
  *[_type == "gig"]|order(date desc){
    _id,
    title,
    date,
    address,
    venue,
    time,
    video_playlist
  }`;
  return await client.fetch<GigsType[]>(qry, {}, { cache: 'no-store' });
}

export async function getGig(id: string) {
  const qry = `
  *[_type == "gig" && _id == "${id}"]|order(data desc){
    _id,
    title,
    date,
    address,
    venue,
    time,
    video_playlist,
  setlist->{
    _id,
    title,
    "songs": songs[]->{ 
    _id,
    "id": _id,
    title,
    artist,
    "artwork": cover_art.asset->url,
    "audio": audio.asset->url,
    last_played_at,
    dualGuitar,
    dualVocal,
    notes,
    duration,
    version
  },
  }
}[0]`;
  return await client.fetch<GigType>(qry, {}, { cache: 'no-store' });
}
