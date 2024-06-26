import {GigType} from "@/lib/interface";

export default function Gig({gig}: { gig: GigType }) {
  return <div>
    <h1>{gig.title}</h1>
    <h2>{gig.date}</h2>
    <h3>{gig.address}</h3>
  </div>
}