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
  const { load, paused, togglePlayPause, duration, stop, seek, isLoading } = useGlobalAudioPlayer();

  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSelectedSong = usePlayerStore((state) => state.setCurrentSong);
  const playlist = usePlayerStore((state) => state.playlist);
  const songIndex = usePlayerStore((state) => state.songIndex);
  const setSongIndex = usePlayerStore((state) => state.setSongIndex);
  const isChangingSong = usePlayerStore((state) => state.isChangingSong);
  const setIsChangingSong = usePlayerStore((state) => state.setIsChangingSong);
  
  // Track loading state per song to prevent race conditions
  const loadingRef = useRef<string | null>(null);

  const skipTrack = useCallback((increment: number) => {
    if (!selectedSong || !playlist.length) return;

    const currentIndex = playlist.findIndex((song) => song._id === selectedSong._id);
    let nextIndex = (currentIndex + increment + playlist.length) % playlist.length;
    
    setSongIndex(nextIndex);
  }, [selectedSong, playlist, setSongIndex]);

  // Update selected song when index changes
  useEffect(() => {
    if (playlist.length === 0) return;
    
    const nextIndex = songIndex % playlist.length;
    const nextSong = playlist[nextIndex];
    
    if (nextSong && nextSong._id !== selectedSong?._id) {
      setSelectedSong(nextSong);
    }
  }, [songIndex, playlist, selectedSong, setSelectedSong]);

  const nextTrack = useCallback(() => {
    if (isChangingSong) return;
    skipTrack(1);
  }, [isChangingSong, skipTrack]);

  const previousTrack = useCallback(() => {
    if (isChangingSong) return;
    skipTrack(-1);
  }, [isChangingSong, skipTrack]);

  const playTrack = useCallback(
    async (song: SongType) => {
      if (!song || !song.audio) {
        console.error('Invalid song or no audio available');
        return;
      }

      // Prevent loading the same song multiple times
      if (loadingRef.current === song._id) {
        return;
      }

      // Mark this song as loading
      loadingRef.current = song._id;
      
      // Stop current playback
      stop();
      setIsChangingSong(true);
      
      try {
        let url = await getAudioFromCache(song._id, song.version || 0);
        if (!url) {
          url = await fetchAndCacheAudio(song, song.audio as string);
        }
        
        // Only load if this is still the song we want to play
        if (loadingRef.current === song._id) {
          load(url, {
            autoplay: true,
            format: 'mp3',
            html5: true,
            onload: () => {
              if (loadingRef.current === song._id) {
                setIsChangingSong(false);
                loadingRef.current = null;
              }
            },
            onend: () => {
              // Auto-advance to next track
              setSongIndex(songIndex + 1);
            }
          });
        }
      } catch (error) {
        console.error('Error loading track:', error);
        setIsChangingSong(false);
        loadingRef.current = null;
      }
    },
    [stop, load, setIsChangingSong, setSongIndex, songIndex]
  );

  // Play track when selected song changes
  useEffect(() => {
    if (!selectedSong) return;
    
    if (!selectedSong.audio) {
      nextTrack();
      return;
    }
    
    playTrack(selectedSong);
  }, [selectedSong?._id]); // Only depend on song ID to avoid circular dependencies

  const playPauseTrack = useCallback(() => {
    if (isChangingSong) return;
    togglePlayPause();
  }, [isChangingSong, togglePlayPause]);

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