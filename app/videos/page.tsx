import React from "react";
import {getGigs} from "@/lib/sanity";


export default async function Home() {
    const gigs = await getGigs();

    return (
        <div className={"flex flex-col mx-auto  items-center justify-center"}>
            {gigs
                .filter(gig => gig.video_playlist !== null)
                .map(gig => {
                return <a key={gig._id} href={`/videos/gigs/${gig._id}`} className={"mx-auto my-4"}>
                    <h1>{gig.title}</h1>
                    <h2>{gig.date}</h2>
                </a>
            })}
        </div>
    );
}
