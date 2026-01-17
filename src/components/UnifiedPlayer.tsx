'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { usePlayerStore } from '@/store/store';
import { useSongWithDetails } from '@/hooks/convex';
import { StemPlayerControls } from '@/components/StemPlayerControls';
import { SingleTrackPlayer } from '@/components/SingleTrackPlayer';
import type { Stem } from '@/types/stems';
import { THEME } from '@/themes';

export function UnifiedPlayer() {
  const router = useRouter();
  const { currentSong } = usePlayerStore();
  const { pause } = useGlobalAudioPlayer();
  const hasStoppedGlobalRef = useRef(false);

  // Stop the global audio player immediately when player page mounts
  // This prevents audio from continuing to play from the mini player
  useEffect(() => {
    if (!hasStoppedGlobalRef.current) {
      pause();
      hasStoppedGlobalRef.current = true;
    }
  }, [pause]);

  // Fetch song details to get stems/audio cues
  const songDetails = useSongWithDetails(currentSong?.slug);

  // If no song is selected, redirect to practice page
  useEffect(() => {
    if (currentSong === null) {
      router.push('/practice');
    }
  }, [currentSong, router]);

  // Loading state while fetching song details
  if (!currentSong || songDetails === undefined) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${THEME.bg}`}>
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Loading player...</p>
      </div>
    );
  }

  // Song not found in database (might be from external source)
  // Fall back to single track player
  if (songDetails === null) {
    return <SingleTrackPlayer />;
  }

  // Check if song has stems (audio cues)
  const audioCues = songDetails.audioCues || [];
  const hasStems = audioCues.length > 0;

  if (hasStems) {
    // Convert audio cues to stems format
    const stems: Stem[] = audioCues.map((cue) => ({
      id: cue._id,
      title: cue.title,
      url: cue.cueUrl || '',
      duration: cue.durationSeconds ?? null,
      description: cue.description ?? null,
      sortOrder: cue.sortOrder ?? 0,
    }));

    return (
      <StemPlayerControls
        stems={stems}
        songTitle={songDetails.title}
        artworkUrl={songDetails.artworkUrl ?? undefined}
      />
    );
  }

  // No stems - show single track player
  return <SingleTrackPlayer />;
}
