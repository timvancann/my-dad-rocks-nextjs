import imageBuilder from "@sanity/image-url";
import {createClient} from "next-sanity";
import {SetlistType, SongType} from "@/lib/interface";

export const client = createClient({
  apiVersion: '2023-05-03',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
})

const builder = imageBuilder(client);

export function urlFor(source: any) {
  return builder.image(source)
}

export async function updateSetlistSongs(setlistId: string, reorderedSongs: SongType[]) {
  console.log('Updating setlist:', setlistId, reorderedSongs);
  const response = await client
    .patch(setlistId)
    .set({
      songs: reorderedSongs.map(song => ({_type: 'reference', _ref: song._id}))
    })
    .commit()
    .then((updatedBike) => {
      console.log('Hurray, the bike is updated! New document:')
      console.log(updatedBike)
    })
    .catch((err) => {
      console.error('Oh no, the update failed: ', err.message)
    })
}

export async function getAllSongs() {
  const qry = `
  *[_type == "song"]|order(title){
    _id,
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
