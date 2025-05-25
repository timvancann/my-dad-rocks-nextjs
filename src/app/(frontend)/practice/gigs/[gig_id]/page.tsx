import { Gig } from '@/components/Gig';
import { getGig } from '@/actions/supabase';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ gig_id: string }> }) {
  const params = await props.params;
  const gig = await getGig(params.gig_id);

  if (!gig) {
    notFound();
  }

  return <Gig gig={gig} />;
}
