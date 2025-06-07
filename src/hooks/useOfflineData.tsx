import { useEffect, useState } from 'react';
import { offlineSync } from '@/lib/offline-sync';
import { useNetworkStatus } from './useNetworkStatus';
import type { Song, Gig, Setlist, SongSection } from '@/lib/db';

export function useOfflineSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const localSongs = await offlineSync.getSongs();
        setSongs(localSongs);

        // Trigger sync if online and data is stale
        if (isOnline && await offlineSync.needsSync()) {
          await offlineSync.syncData();
          const updatedSongs = await offlineSync.getSongs();
          setSongs(updatedSongs);
        }
      } catch (error) {
        console.error('Failed to load songs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, [isOnline]);

  return { songs, loading, isOffline: !isOnline };
}

export function useOfflineGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const loadGigs = async () => {
      try {
        const localGigs = await offlineSync.getGigs();
        setGigs(localGigs);

        if (isOnline && await offlineSync.needsSync()) {
          await offlineSync.syncData();
          const updatedGigs = await offlineSync.getGigs();
          setGigs(updatedGigs);
        }
      } catch (error) {
        console.error('Failed to load gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGigs();
  }, [isOnline]);

  return { gigs, loading, isOffline: !isOnline };
}

export function useOfflineSetlist(gigId: string) {
  const [setlist, setSetlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const loadSetlist = async () => {
      try {
        const localSetlist = await offlineSync.getSetlist(gigId);
        setSetlist(localSetlist);

        if (isOnline && await offlineSync.needsSync()) {
          await offlineSync.syncData();
          const updatedSetlist = await offlineSync.getSetlist(gigId);
          setSetlist(updatedSetlist);
        }
      } catch (error) {
        console.error('Failed to load setlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSetlist();
  }, [gigId, isOnline]);

  return { setlist, loading, isOffline: !isOnline };
}

export function useOfflineSongSections(songId: string) {
  const [sections, setSections] = useState<SongSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const loadSections = async () => {
      try {
        const localSections = await offlineSync.getSongSections(songId);
        setSections(localSections);

        if (isOnline && await offlineSync.needsSync()) {
          await offlineSync.syncData();
          const updatedSections = await offlineSync.getSongSections(songId);
          setSections(updatedSections);
        }
      } catch (error) {
        console.error('Failed to load song sections:', error);
      } finally {
        setLoading(false);
      }
    };

    if (songId) {
      loadSections();
    }
  }, [songId, isOnline]);

  return { sections, loading, isOffline: !isOnline };
}