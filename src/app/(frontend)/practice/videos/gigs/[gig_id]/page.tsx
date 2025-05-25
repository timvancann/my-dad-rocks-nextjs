import { getGig } from '@/actions/supabase';
import GigVideo from '@/components/GigVideo';
import { notFound } from 'next/navigation';

export default async function Video(props: { params: Promise<{ gig_id: string }> }) {
  const params = await props.params;
  const gig = await getGig(params.gig_id);
  if (!gig) {
    notFound();
  }
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <GigVideo gig={gig} />
    </div>
  );
}
