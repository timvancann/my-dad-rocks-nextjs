import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProposalVoteStatus } from '@/lib/interface';
import { ensureBandMemberAvatar } from '@/lib/supabase-service';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}

if (!serviceRoleKey) {
  throw new Error('NEXT_PRIVATE_SUPABASE_SERVICE_KEY is not configured');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

const VOTE_STATUSES: ProposalVoteStatus[] = ['accepted', 'rejected'];

const isValidStatus = (value: unknown): value is ProposalVoteStatus =>
  typeof value === 'string' && VOTE_STATUSES.includes(value as ProposalVoteStatus);

const isValidUuid = (value: string | undefined | null): value is string =>
  !!value && /^[0-9a-fA-F-]{36}$/.test(value);

async function fetchProposalVotes(proposalId: string) {
  const { data, error } = await supabase
    .from('proposal_votes')
    .select('band_member_id, status')
    .eq('proposal_id', proposalId);

  if (error) {
    throw new Error(error.message || 'Kon stemmingen niet ophalen');
  }

  return data ?? [];
}

export async function POST(request: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { id: proposalParam } = await params;
    const proposalId = proposalParam;
    if (!isValidUuid(proposalId)) {
      return NextResponse.json({ error: 'Ongeldige proposal ID' }, { status: 400 });
    }

    const payload = await request.json().catch(() => null);
    const status = payload?.status;

    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Ongeldige stemstatus' }, { status: 400 });
    }

    const bandMember = await ensureBandMemberAvatar(session.user.email, session.user.image ?? null, session.user.name ?? null);

    if (!bandMember?.id) {
      return NextResponse.json({ error: 'Je e-mailadres is niet gekoppeld aan een bandlid' }, { status: 403 });
    }

    const { error } = await supabase
      .from('proposal_votes')
      .upsert({
        proposal_id: proposalId,
        band_member_id: bandMember.id,
        status
      }, { onConflict: 'proposal_id,band_member_id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const votes = await fetchProposalVotes(proposalId);

    return NextResponse.json({ votes }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout bij het opslaan van de stem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { id: proposalParam } = await params;
    const proposalId = proposalParam;
    if (!isValidUuid(proposalId)) {
      return NextResponse.json({ error: 'Ongeldige proposal ID' }, { status: 400 });
    }

    const bandMember = await ensureBandMemberAvatar(session.user.email, session.user.image ?? null, session.user.name ?? null);

    if (!bandMember?.id) {
      return NextResponse.json({ error: 'Je e-mailadres is niet gekoppeld aan een bandlid' }, { status: 403 });
    }

    const { error } = await supabase
      .from('proposal_votes')
      .delete()
      .eq('proposal_id', proposalId)
      .eq('band_member_id', bandMember.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const votes = await fetchProposalVotes(proposalId);

    return NextResponse.json({ votes }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout bij het verwijderen van de stem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
