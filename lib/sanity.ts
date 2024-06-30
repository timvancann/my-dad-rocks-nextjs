import imageBuilder from "@sanity/image-url";
import {createClient} from "next-sanity";
import {GigsType, GigType, SetlistType, SongType} from "@/lib/interface";

const client = createClient({
  apiVersion: '2023-05-03',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
})

const builder = imageBuilder(client);

export function urlFor(source: any) {
  return builder.image(source)
}

export async function getAllSongs() {
  const qry = `
  *[_type == "song"]|order(title){
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
    last_played_at
  }`
  return await client.fetch<SongType[]>(qry);
}

export async function getSetlist(title: string) {
  const qry = `
   *[_type == "setlist" && title == "${title}"]{
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
  return await client.fetch<SetlistType>(qry);
}

export async function getLyrics(id: string) {
  const qry = `
*[_type == "song" && _id == "${id}"][0]{
  title, artist, lyrics
  }`
  return await client.fetch<LyricType>(qry);
}

type LyricType = {
  title: string,
  artist: string,
  lyrics?: any
}

export async function getGigs() {
  const qry = `
  *[_type == "gig"]|order(data desc){
    _id,
    title,
    date
  }`
  return await client.fetch<GigsType[]>(qry);
}

export async function getGig(id: string) {
  const qry = `
  *[_type == "gig" && _id == "${id}"]|order(data desc){
    _id,
    title,
    date,
    address,
  setlist->{
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
    last_played_at    
  },
  }
}[0]`
  return await client.fetch<GigType>(qry);
}

