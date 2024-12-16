import { useEffect, useRef, useState } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { usePlayerStore } from '@/store/store';
import { SongType } from '@/lib/interface';

export const useAudioTime = () => {
  const frameRef = useRef<number>();
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
  const { load, paused, togglePlayPause, duration, stop, seek, looping } = useGlobalAudioPlayer();

  const selectedSong = usePlayerStore(state => state.currentSong);
  const setSelectedSong = usePlayerStore(state => state.setCurrentSong);
  const playlist = usePlayerStore(state => state.playlist);
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);

  const skipTrack = (increment: number) => {
    if (!selectedSong || !playlist.length) return;

    const currentIndex = playlist.findIndex(song => song.id === selectedSong.id);
    const nextIndex = (currentIndex + increment) % playlist.length;
    const nextSong = playlist[nextIndex];
    playTrack(nextSong);
  };

  const nextTrack = () => {
    skipTrack(1);
  };
  const previousTrack = () => {
    skipTrack(-1);
  };

  const playTrack = (song: SongType) => {
    setSelectedSong(song);
    load(song.audio, {
      autoplay: true,
      loop: looping,
      onend: nextTrack
    });
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
    duration
  };
};
