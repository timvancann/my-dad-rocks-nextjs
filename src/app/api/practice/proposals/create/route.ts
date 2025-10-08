import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const bandMember = await ensureBandMemberAvatar(session.user.email, session.user.image ?? null, session.user.name ?? null);

    if (!bandMember?.id) {
      return NextResponse.json({ error: 'Je e-mailadres is niet gekoppeld aan een bandlid' }, { status: 403 });
    }

    const payload = await request.json();
    const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
    const band = typeof payload?.band === 'string' ? payload.band.trim() : '';
    const album = typeof payload?.album === 'string' ? payload.album.trim() : undefined;
    const coverart = typeof payload?.coverart === 'string' ? payload.coverart.trim() : undefined;
    const uri = typeof payload?.uri === 'string' ? payload.uri.trim() : undefined;

    if (!title || !band || !uri) {
      return NextResponse.json({ error: 'Titel, artiest en Spotify URI zijn verplicht.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        title,
        band,
        album: album ?? null,
        coverart: coverart ?? null,
        uri: uri ?? null,
        created_by: bandMember.id
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const { error: voteError } = await supabase
      .from('proposal_votes')
      .upsert({
        proposal_id: data.id,
        band_member_id: bandMember.id,
        status: 'accepted'
      }, { onConflict: 'proposal_id,band_member_id' });

    if (voteError) {
      console.error('Error seeding initial proposal vote:', voteError);
    }

    return NextResponse.json({ proposal: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Onbekende fout bij het opslaan van het voorstel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
