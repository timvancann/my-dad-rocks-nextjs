import GigList from '@/components/GigList';
import { getGigs } from '@/lib/sanity';

export default async function Home() {
  const data = await getGigs();

  return (
    <div className="items-center justify-center md:flex md:flex-col">
      <GigList gigs={data} />
    </div>
  );
}
