import GigList from '@/components/GigList';
import { getGigs } from '@/actions/supabase';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { THEME } from '@/themes';

export default async function Home() {
  const data = await getGigs();

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gigs</h1>
        <Link 
          href="/practice/gigs/new" 
          className={`inline-flex items-center gap-2 px-4 py-2 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white rounded-md font-medium transition-colors`}
        >
          <Plus className="h-4 w-4" />
          Nieuwe Gig
        </Link>
      </div>
      <GigList gigs={data} />
    </div>
  );
}
