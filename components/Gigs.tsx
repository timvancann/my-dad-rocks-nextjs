import {GigsType} from "@/lib/interface";

export default function Gigs({gigs}: { gigs: GigsType[] }) {
  return <div>
    {gigs.map(gig => {
      return <a key={gig._id} href={`/gigs/${gig._id}`} className={"mx-auto my-4"}>
        <h1>{gig.title}</h1>
        <h2>{gig.date}</h2>
      </a>
    })}
  </div>
}