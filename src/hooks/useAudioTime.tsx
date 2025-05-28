import { db } from '@/lib/db';
import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';

export async function getAudioFromCache(songId: string, version: number): Promise<string | null> {
  const cachedFile = await db.audioFiles.get(songId);
  if (cachedFile && cachedFile.version === version) {
    return URL.createObjectURL(cachedFile.blob); // Convert Blob to URL
  }
  return null;
}

export async function fetchAndCacheAudio(song: SongType, url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  await db.audioFiles.put({ id: song._id, title: song.title, blob, version: song.version || 0 }); // Store in Dexie

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
  const songIndex = usePlayerStore((state) => state.songIndex);
  const setSongIndex = usePlayerStore((state) => state.setSongIndex);
  const isChangingSong = usePlayerStore((state) => state.isChangingSong);
  const setIsChangingSong = usePlayerStore((state) => state.setIsChangingSong);

  const skipTrack = (increment: number) => {
    if (!selectedSong || !playlist.length) return;

    const currentIndex = playlist.findIndex((song) => song._id === selectedSong._id);
    const nextIndex = (currentIndex + increment) % playlist.length;
    setSongIndex(nextIndex);
  };

  useEffect(() => {
    const nextIndex = songIndex % playlist.length;
    const nextSong = playlist[nextIndex];
    setSelectedSong(nextSong);
  }, [songIndex]);

  const nextTrack = () => {
    skipTrack(1);
  };

  const previousTrack = () => {
    skipTrack(-1);
  };

  const playTrack = useCallback(
    async (song: SongType) => {
      if (selectedSong === song) return;
      if (!song.audio) {
        nextTrack();
        return;
      }
      
      // Stop current song immediately
      stop();
      setIsChangingSong(true);
      
      try {
        let url = await getAudioFromCache(song._id, song.version || 0);
        if (!url) {
          url = await fetchAndCacheAudio(song, song.audio as string);
        }
        load(url, {
          autoplay: true,
          format: 'mp3',
          html5: true,
          onload: () => {
            setIsChangingSong(false);
          },
          onend: () => {
            setSongIndex(songIndex + 1);
          }
        });
      } catch (error) {
        setIsChangingSong(false);
        console.error('Error loading track:', error);
      }
    },
    [songIndex, setIsChangingSong, stop]
  );

  useEffect(() => {
    if (!selectedSong) return;
    if (!selectedSong.audio) {
      nextTrack();
      return;
    }
    playTrack(selectedSong);
  }, [selectedSong]);

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
    isLoading,
    isChangingSong
  };
};
