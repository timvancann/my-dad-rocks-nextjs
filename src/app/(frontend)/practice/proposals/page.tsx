import { getProposals } from '@/actions/supabase';
import { ProposalsList } from '@/components/ProposalsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { THEME } from '@/themes';

export const revalidate = 0; // Disable caching

export default async function ProposalsPage() {
  const proposals = await getProposals();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Song Voorstellen</h1>
        <Link href="/practice/proposals/new" className="sm:inline-flex">
          <Button className={`${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white flex items-center gap-2`}>
            <PlusCircle className="h-4 w-4" /> Nieuwe voorstel toevoegen
          </Button>
        </Link>
      </div>
      <ProposalsList proposals={proposals} />
    </div>
  );
}
