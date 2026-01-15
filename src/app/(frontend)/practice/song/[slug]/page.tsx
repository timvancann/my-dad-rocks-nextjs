'use client';

import { useSongWithDetails } from '@/hooks/convex';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SongDetailsClient } from '@/components/SongDetailsClient';

export default function SongPage() {
  const params = useParams();
  const slug = params.slug as string;

  const songData = useSongWithDetails(slug);

  // Loading state
  if (songData === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="mt-4 text-zinc-400">Nummer laden...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (songData === null) {
    notFound();
  }

  // Transform data for SongDetailsClient
  const song = {
    _id: songData._id,
    title: songData.title,
    artist: songData.artist,
    slug: songData.slug,
    artwork: songData.artworkUrl || '',
    audio: songData.audioUrl,
    dualGuitar: songData.dualGuitar,
    dualVocal: songData.dualVocal,
    canPlayWithoutSinger: songData.canPlayWithoutSinger,
    duration: songData.durationSeconds || 0,
    notes: songData.notes,
    key_signature: songData.keySignature,
    tempo_bpm: songData.tempoBpm,
    difficulty_level: songData.difficultyLevel,
    tabs_chords: songData.tabsChords,
    tags: songData.tags,
    last_played_at: songData.lastPlayedAt,
  };

  const stats = {
    times_played: songData.timesPlayed || 0,
    times_practiced: songData.timesPracticed || 0,
    mastery_level: songData.masteryLevel || 1,
    last_practiced_at: songData.lastPracticedAt,
  };

  // Transform audio cues - map Convex format to expected format
  const audioCues = (songData.audioCues || []).map((cue: any) => ({
    id: cue._id,
    title: cue.title,
    cue_url: cue.cueUrl,
    duration_seconds: cue.durationSeconds,
    sort_order: cue.sortOrder,
  }));

  return <SongDetailsClient song={song} stats={stats} audioCues={audioCues} id={songData._id} />;
}
