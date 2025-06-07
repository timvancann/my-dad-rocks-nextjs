import { db, type Song, type Gig, type Setlist, type SongSection, type OfflineSync } from './db';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class OfflineDataSync {
  private static instance: OfflineDataSync;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;

  private constructor() {
    // Initialize sync listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncData());
      
      // Sync every 5 minutes when online
      setInterval(() => {
        if (navigator.onLine && !this.syncInProgress) {
          this.syncData();
        }
      }, 5 * 60 * 1000);
    }
  }

  static getInstance(): OfflineDataSync {
    if (!OfflineDataSync.instance) {
      OfflineDataSync.instance = new OfflineDataSync();
    }
    return OfflineDataSync.instance;
  }

  // Fetch data from Supabase and store locally
  async fetchAndStoreData() {
    try {
      // Fetch all songs
      const { data: songs, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .order('artist', { ascending: true });

      if (!songsError && songs) {
        await db.transaction('rw', db.songs, async () => {
          await db.songs.clear();
          await db.songs.bulkAdd(songs.map(song => ({
            ...song,
            synced_at: new Date().toISOString()
          })));
        });
      }

      // Fetch all gigs
      const { data: gigs, error: gigsError } = await supabase
        .from('gigs')
        .select('*')
        .order('date', { ascending: false });

      if (!gigsError && gigs) {
        await db.transaction('rw', db.gigs, async () => {
          await db.gigs.clear();
          await db.gigs.bulkAdd(gigs.map(gig => ({
            ...gig,
            synced_at: new Date().toISOString()
          })));
        });
      }

      // Fetch all setlists
      const { data: setlists, error: setlistsError } = await supabase
        .from('setlists')
        .select('*');

      if (!setlistsError && setlists) {
        await db.transaction('rw', db.setlists, async () => {
          await db.setlists.clear();
          await db.setlists.bulkAdd(setlists.map(setlist => ({
            ...setlist,
            synced_at: new Date().toISOString()
          })));
        });
      }

      // Fetch all song sections
      const { data: sections, error: sectionsError } = await supabase
        .from('song_sections')
        .select('*');

      if (!sectionsError && sections) {
        await db.transaction('rw', db.songSections, async () => {
          await db.songSections.clear();
          await db.songSections.bulkAdd(sections.map(section => ({
            ...section,
            synced_at: new Date().toISOString()
          })));
        });
      }

      // Update last sync time
      await db.appMetadata.put({
        key: 'lastSyncTime',
        value: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Error fetching and storing data:', error);
      throw error;
    }
  }

  // Sync offline changes to Supabase
  async syncOfflineChanges() {
    const pendingChanges = await db.offlineSync
      .where('synced')
      .equals(0)
      .toArray();

    for (const change of pendingChanges) {
      try {
        switch (change.type) {
          case 'create':
            await this.handleCreate(change);
            break;
          case 'update':
            await this.handleUpdate(change);
            break;
          case 'delete':
            await this.handleDelete(change);
            break;
        }

        // Mark as synced
        await db.offlineSync.update(change.id, { synced: true });
      } catch (error) {
        console.error(`Failed to sync change ${change.id}:`, error);
        // Continue with next change
      }
    }
  }

  private async handleCreate(change: OfflineSync) {
    const { error } = await supabase
      .from(change.table)
      .insert(change.data);

    if (error) {
      throw error;
    }
  }

  private async handleUpdate(change: OfflineSync) {
    const { error } = await supabase
      .from(change.table)
      .update(change.data)
      .eq('id', change.record_id);

    if (error) {
      throw error;
    }
  }

  private async handleDelete(change: OfflineSync) {
    const { error } = await supabase
      .from(change.table)
      .delete()
      .eq('id', change.record_id);

    if (error) {
      throw error;
    }
  }

  // Main sync function
  async syncData() {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;

    try {
      // First, sync offline changes to server
      await this.syncOfflineChanges();

      // Then, fetch latest data from server
      await this.fetchAndStoreData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Helper methods for offline-first operations
  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at' | 'synced_at'>) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newSong: Song = {
      ...song,
      id,
      created_at: now,
      updated_at: now,
      synced_at: now
    };

    // Save to local DB
    await db.songs.add(newSong);

    // Queue for sync
    if (navigator.onLine) {
      // Try immediate sync
      try {
        const { error } = await supabase.from('songs').insert(newSong);
        if (error) throw error;
      } catch (error) {
        // Fall back to queuing
        await this.queueOfflineChange('create', 'songs', id, newSong);
      }
    } else {
      await this.queueOfflineChange('create', 'songs', id, newSong);
    }

    return newSong;
  }

  async updateSong(id: string, updates: Partial<Song>) {
    const now = new Date().toISOString();
    updates.updated_at = now;

    // Update local DB
    await db.songs.update(id, updates);

    // Queue for sync
    if (navigator.onLine) {
      try {
        const { error } = await supabase.from('songs').update(updates).eq('id', id);
        if (error) throw error;
      } catch (error) {
        await this.queueOfflineChange('update', 'songs', id, updates);
      }
    } else {
      await this.queueOfflineChange('update', 'songs', id, updates);
    }
  }

  async deleteSong(id: string) {
    // Delete from local DB
    await db.songs.delete(id);

    // Queue for sync
    if (navigator.onLine) {
      try {
        const { error } = await supabase.from('songs').delete().eq('id', id);
        if (error) throw error;
      } catch (error) {
        await this.queueOfflineChange('delete', 'songs', id, {});
      }
    } else {
      await this.queueOfflineChange('delete', 'songs', id, {});
    }
  }

  private async queueOfflineChange(
    type: 'create' | 'update' | 'delete',
    table: string,
    record_id: string,
    data: any
  ) {
    await db.offlineSync.add({
      id: crypto.randomUUID(),
      type,
      table,
      record_id,
      data,
      created_at: new Date().toISOString(),
      synced: false
    });
  }

  // Get data from local DB
  async getSongs() {
    return await db.songs.toArray();
  }

  async getSong(id: string) {
    return await db.songs.get(id);
  }

  async getGigs() {
    return await db.gigs.orderBy('date').reverse().toArray();
  }

  async getGig(id: string) {
    return await db.gigs.get(id);
  }

  async getSetlist(gigId: string) {
    const setlistItems = await db.setlists
      .where('gig_id')
      .equals(gigId)
      .sortBy('order_index');

    // Join with songs
    const songs = await Promise.all(
      setlistItems.map(item => db.songs.get(item.song_id))
    );

    return setlistItems.map((item, index) => ({
      ...item,
      song: songs[index]
    }));
  }

  async getSongSections(songId: string) {
    return await db.songSections
      .where('song_id')
      .equals(songId)
      .sortBy('order_index');
  }

  // Check if data needs sync
  async needsSync() {
    const lastSync = await db.appMetadata.get('lastSyncTime');
    if (!lastSync) return true;

    const lastSyncDate = new Date(lastSync.value);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync > 1; // Sync if more than 1 hour old
  }
}

// Export singleton instance
export const offlineSync = OfflineDataSync.getInstance();