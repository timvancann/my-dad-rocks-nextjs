'use client';

import { ProposalsList } from '@/components/ProposalsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { THEME } from '@/themes';
import { useSession } from 'next-auth/react';
import { useProposals, useBandMembers, useEnsureBandMember } from '@/hooks/convex';
import { useEffect } from 'react';
import { BandMember, ProposalType, ProposalVote } from '@/lib/interface';

export default function ProposalsPage() {
  const { data: session } = useSession();
  const convexProposals = useProposals();
  const convexBandMembers = useBandMembers();
  const ensureBandMember = useEnsureBandMember();

  // Ensure band member avatar is synced when user loads this page
  useEffect(() => {
    const syncAvatar = async () => {
      if (session?.user?.email) {
        try {
          await ensureBandMember({
            email: session.user.email,
            name: session.user.name ?? undefined,
            avatarUrl: session.user.image ?? undefined,
          });
        } catch (error) {
          console.error('Error syncing band member:', error);
        }
      }
    };
    syncAvatar();
  }, [session?.user?.email, session?.user?.name, session?.user?.image, ensureBandMember]);

  // Loading state
  if (convexProposals === undefined || convexBandMembers === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Voorstellen laden...</p>
      </div>
    );
  }

  // Transform Convex data to match interface types
  const proposals: ProposalType[] = (convexProposals || []).map((p) => ({
    _id: p._id,
    title: p.title ?? '',
    band: p.band ?? '',
    album: p.album ?? '',
    coverart: p.coverart ?? '',
    uri: p.uri,
    createdBy: p.createdBy,
    votes: (p.votes || []).map((v) => ({
      bandMemberId: v.bandMemberId,
      status: v.status as 'accepted' | 'rejected',
    })),
  }));

  const bandMembers: BandMember[] = (convexBandMembers || []).map((m) => ({
    id: m._id,
    email: m.email,
    name: m.name ?? null,
    role: m.role ?? null,
    avatarUrl: m.avatarUrl ?? null,
  }));

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
