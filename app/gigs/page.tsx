import React from "react";
import {client} from "@/lib/sanity";
import Gigs from "@/components/Gigs";
import {GigsType} from "@/lib/interface";


async function getData() {
  const qry = `
  *[_type == "gig"]|order(data desc){
    _id,
    title,
    date
  }`
  return await client.fetch<GigsType[]>(qry);
}

export default async function Home() {
  const data = await getData();

  return (
    <div className={"flex flex-col mx-auto  items-center justify-center"}>
      <Gigs gigs={data}/>
    </div>
  );
}