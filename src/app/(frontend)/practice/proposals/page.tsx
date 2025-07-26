import { getProposals } from '@/actions/supabase';
import { ProposalsList } from '@/components/ProposalsList';

export const revalidate = 0; // Disable caching

export default async function ProposalsPage() {
  const proposals = await getProposals();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Song Voorstellen</h1>
      <ProposalsList proposals={proposals} />
    </div>
  );
}