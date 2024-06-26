import {GigsType} from "@/lib/interface";

export default function Gigs({gigs}: { gigs: GigsType[] }) {
  return <div>
    {gigs.map(gig => {
      return <a href={`/gigs/${gig._id}`}><div key={gig._id}>
        <h1>{gig.title}</h1>
        <h2>{gig.date}</h2>
      </div></a>
    })}
  </div>
}