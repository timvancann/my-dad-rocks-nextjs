import GigList from '@/components/GigList';
import { getGigs } from '@/lib/sanity';

export default async function Home() {
  const data = await getGigs();

  return (
    <div className="flex flex-col ">
      <GigList gigs={data} />
    </div>
  );
}
