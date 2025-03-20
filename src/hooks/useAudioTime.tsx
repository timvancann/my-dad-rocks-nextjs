import { db} from '@/lib/db';
import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { useEffect, useRef, useState } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';

export async function getAudioFromCache(songId: string): Promise<string | null> {
  const cachedFile = await db.audioFiles.get(songId);
  if (cachedFile) {
    return URL.createObjectURL(cachedFile.blob); // Convert Blob to URL
  }
  return null;
}

export async function fetchAndCacheAudio(song: SongType, url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  await db.audioFiles.put({ id: song._id, title: song.title, blob}); // Store in Dexie

  return URL.createObjectURL(blob);
}

export const useAudioTime = () => {
  const frameRef = useRef<number>(undefined);
  const [pos, setPos] = useState(0);
  const { getPosition } = useGlobalAudioPlayer();

  useEffect(() => {
    const animate = () => {
      setPos(getPosition());
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [getPosition]);

  return pos;
};

export const usePlaylistPlayer = () => {
  const { load, paused, togglePlayPause, duration, stop, seek, looping, isLoading } = useGlobalAudioPlayer();

  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSelectedSong = usePlayerStore((state) => state.setCurrentSong);
  const playlist = usePlayerStore((state) => state.playlist);
  
  const skipTrack = async (increment: number) => {
    if (!selectedSong || !playlist.length) return;

    const currentIndex = playlist.findIndex((song) => song._id === selectedSong._id);
    const nextIndex = (currentIndex + increment) % playlist.length;
    const nextSong = playlist[nextIndex];
    playTrack(nextSong);
  };

  const nextTrack = async () => {
    skipTrack(1);
  };
  const previousTrack = async () => {
    skipTrack(-1);
  };

  const playTrack = async (song: SongType) => {
    if (!song.audio) {
      nextTrack();
      return;
    }
    setSelectedSong(song);
    let url = await getAudioFromCache(song._id);
    if (!url) {
      url = await fetchAndCacheAudio(song, song.audio as string);
    }
    load(url, { autoplay: true, format: 'mp3' });
  };

  const playPauseTrack = () => {
    togglePlayPause();
  };

  const stopTrack = () => {
    stop();
  };

  const seekTrack = (seconds: number) => {
    seek(seconds);
  };

  return {
    nextTrack,
    previousTrack,
    playTrack,
    playPauseTrack,
    stopTrack,
    seekTrack,
    paused,
    duration,
    isLoading
  };
};
