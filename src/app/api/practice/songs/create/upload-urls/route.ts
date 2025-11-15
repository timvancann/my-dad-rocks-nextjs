import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/slug';
import { createObjectPath, resolveExtension, SongUploadKind, StorageBucket } from '../utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

type UploadAssetRequest = {
  kind: SongUploadKind;
  bucket: StorageBucket;
  fileName?: string | null;
  contentType?: string | null;
};

type SignedUploadTarget = {
  kind: SongUploadKind;
  bucket: StorageBucket;
  path: string;
  publicUrl: string;
  token: string;
};

export async function POST(request: Request) {
  let body: { title?: string; assets?: UploadAssetRequest[] };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Ongeldige JSON payload' }, { status: 400 });
  }

  const title = body.title?.toString().trim();
  const assets = Array.isArray(body.assets) ? body.assets : [];

  if (!title) {
    return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 });
  }

  if (assets.length === 0) {
    return NextResponse.json({ error: 'Geen bestanden om te uploaden' }, { status: 400 });
  }

  try {
    const slugBase = generateSlug(title);

    const uploads: SignedUploadTarget[] = await Promise.all(
      assets.map(async asset => {
        if (asset.bucket !== 'artwork' && asset.bucket !== 'songs') {
          throw new Error('Ongeldige bucket opgegeven');
        }

        const extension = resolveExtension({
          fileName: asset.fileName,
          contentType: asset.contentType,
          fallback: asset.bucket === 'artwork' ? 'jpg' : 'bin'
        });

        const { objectPath } = createObjectPath(slugBase, extension);
        const { data, error } = await supabase.storage
          .from(asset.bucket)
          .createSignedUploadUrl(objectPath, { upsert: false });

        if (error || !data?.token) {
          throw new Error(`Kon geen upload-URL genereren: ${error?.message ?? 'Onbekende fout'}`);
        }

        const { data: publicData } = supabase.storage.from(asset.bucket).getPublicUrl(objectPath);

        if (!publicData?.publicUrl) {
          throw new Error('Kon geen publieke URL genereren voor het bestand');
        }

        return {
          kind: asset.kind,
          bucket: asset.bucket,
          path: objectPath,
          token: data.token,
          publicUrl: publicData.publicUrl
        } satisfies SignedUploadTarget;
      })
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
