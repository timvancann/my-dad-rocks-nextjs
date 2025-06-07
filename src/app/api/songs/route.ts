import { getAllSongs } from '@/actions/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const songs = await getAllSongs();
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}