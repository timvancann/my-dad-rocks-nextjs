import {client} from "@/lib/sanity";
import {SongType} from "@/lib/interface";
import React from "react";
import {Songs} from "@/components/SongCard";


async function getData() {
  const qry = `*[_type == "song"]{
title,
artist,
cover_art,
audio{
  asset->{
  _id,
  url
}},
last_played_at,
lyrics
  }`
  return await client.fetch(qry);
}

export default async function Home() {
  const data: SongType[] = await getData();
  return <Songs songs={data}/>;
}