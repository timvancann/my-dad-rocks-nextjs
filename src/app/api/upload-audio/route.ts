import { NextResponse } from 'next/server';
import { compressAudio } from '@/lib/audio-compress';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const runtime = 'nodejs';

// Maximum file size: 100MB (pre-compression)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');

    // Validate required fields
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Only audio files are allowed' }, { status: 400 });
    }

    // Read the file into a buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Compress the audio to 128kbps MP3
    const compressionResult = await compressAudio(inputBuffer, file.name, {
      bitrate: 128,
      format: 'mp3',
    });

    console.log(
      `Compressed ${file.name}: ${(compressionResult.originalSize / 1024 / 1024).toFixed(2)}MB -> ${(compressionResult.compressedSize / 1024 / 1024).toFixed(2)}MB (${compressionResult.compressionRatio.toFixed(1)}x reduction)`
    );

    // Initialize Convex client
    const convexUrl = process.env.CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: 'Convex URL not configured' }, { status: 500 });
    }
    const client = new ConvexHttpClient(convexUrl);

    // Get upload URL from Convex
    const uploadUrl = await client.mutation(api.songs.generateUploadUrl, {});

    // Upload compressed file to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': compressionResult.contentType },
      body: compressionResult.buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload to Convex failed: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();

    return NextResponse.json({
      success: true,
      storageId,
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
      compressionRatio: compressionResult.compressionRatio,
    });
  } catch (error: unknown) {
    console.error('Upload audio error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
