"use server";

import {createClient} from "next-sanity";
import {SongType} from "@/lib/interface";


export async function updateSetlistSongs(reorderedSongs: SongType[], setlistId: string) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN,
  })

  await client
    .patch(setlistId)
    .set({
      songs: reorderedSongs.map(song => ({_type: 'reference', _ref: song._id}))
    })
    .commit()
    .then((state) => {
      return {
        message: "Successfully updated the setlist",
        payload: state
      }
    })
    .catch((err) => {
      return {
        message: 'Oh no, the update failed',
        payload: err
      }
    })
  return {
    message: 'Oh no, the update failed',
    payload: null
  }
}
