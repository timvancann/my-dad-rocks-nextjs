import { Gig } from '@/components/Gig';
import { getGig } from '@/lib/sanity';

export default async function Page(props: { params: Promise<{ gig_id: string }> }) {
  const params = await props.params;
  const gig = await getGig(params.gig_id);

  return <Gig gig={gig} />;
}
