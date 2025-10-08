import { getProposals } from '@/actions/supabase';
import { ProposalsList } from '@/components/ProposalsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { THEME } from '@/themes';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureBandMemberAvatar } from '@/lib/supabase-service';

export const revalidate = 0; // Disable caching

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    await ensureBandMemberAvatar(session.user.email, session.user.image ?? null, session.user.name ?? null);
  }

  const { proposals, bandMembers } = await getProposals();

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
      <ProposalsList proposals={proposals} bandMembers={bandMembers} />
    </div>
  );
}
