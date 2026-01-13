import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const songSlug = formData.get('songSlug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine bucket and path based on type
    let bucket: string;
    let objectPath: string;

    if (type === 'cover') {
      bucket = 'artwork';
      objectPath = `covers/${fileName}`;
    } else if (type === 'cue') {
      // Use stems bucket with song slug subfolder
      bucket = 'stems';
      if (!songSlug) {
        return NextResponse.json({ error: 'Song slug required for stem uploads' }, { status: 400 });
      }
      objectPath = `${songSlug}/${fileName}`;
    } else {
      // Regular audio files
      bucket = 'songs';
      objectPath = `audio/${fileName}`;
    }

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(objectPath);

    if (!publicData?.publicUrl) {
      return NextResponse.json({ error: 'Failed to generate public URL' }, { status: 500 });
    }

    return NextResponse.json({ url: publicData.publicUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
