import {SongType} from "@/lib/interface";
import {client} from "@/lib/sanity";
import {SongList} from "@/components/SongCard";

async function getData() {
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
  return await client.fetch(qry);
}

export default async function Songs() {
  const data: SongType[] = await getData();
  return (<SongList songs={data} isSetlist={false} title={"Overige Nummers"}/>)
}