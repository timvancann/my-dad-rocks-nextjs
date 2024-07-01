"use server";

import {createClient} from "next-sanity";
import {SongType} from "@/lib/interface";
import {revalidatePath} from "next/cache";


export async function updateSetlistSongs(reorderedSongs: SongType[], setlistId: string) {
  const client = createClient({
    apiVersion: '2023-05-03',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.NEXT_PRIVATE_SANITY_TOKEN,
  })

  return await client
    .patch(setlistId)
    .set({
      songs: reorderedSongs.map(song => ({_type: 'reference', _ref: song._id, _key: song._id}))
    })
    .commit()
    .then((state) => {
      const retVal = {
        message: "Successfully updated the setlist",
        payload: state
      }
      console.log(retVal)
      return retVal
    })
    .catch((err) => {
      const retVal = {
        message: "Oh no, the update failed",
        payload: err
      }
      console.log(retVal)
      return retVal
    })
}
