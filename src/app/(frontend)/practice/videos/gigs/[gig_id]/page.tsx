import { getGig } from '@/actions/supabase';
import GigVideo from '@/components/GigVideo';
import { notFound } from 'next/navigation';

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Video(props: { params: Promise<{ gig_id: string }> }) {
  const params = await props.params;
  
  // Validate that gig_id is a valid UUID format
  if (!UUID_REGEX.test(params.gig_id)) {
    notFound();
  }
  
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
