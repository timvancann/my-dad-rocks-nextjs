import { GigsType, GigType, SetlistType, SongType, ProposalType } from './interface';
import { supabase } from './supabase';

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

// Convert Supabase data to match existing interfaces
function mapSupabaseSongToSongType(song: any): SongType & { key_signature?: string; tempo_bpm?: number; tags?: string[]; tabs_chords?: string } {
  return {
    _id: song.id,
    id: song.id,
    title: song.title,
    artist: song.artist || '',
    slug: song.slug || generateSlug(song.title),
    artwork: song.artwork_url || '',
    audio: song.audio_url || '',
    last_played_at: song.last_played_at,
    dualGuitar: song.dual_guitar || false,
    dualVocal: song.dual_vocal || false,
    notes: song.notes || '',
    duration: song.duration_seconds || 0,
    version: song.updated_at,
    // Additional fields not in the interface but useful for display
    key_signature: song.key_signature,
    tempo_bpm: song.tempo_bpm,
    tags: song.tags || [],
    tabs_chords: song.tabs_chords
  } as any;
}

export async function getAllSongs(): Promise<SongType[]> {
  const { data, error } = await supabase.from('songs').select('*').order('title');

  if (error) {
    console.error('Error fetching songs:', error);
    return [];
  }

  return (data || []).map(mapSupabaseSongToSongType);
}

export async function getSetlist(title: string): Promise<SetlistType> {
  // First get the setlist
  const { data: setlistData, error: setlistError } = await supabase.from('setlists').select('*').eq('title', title).single();

  if (setlistError || !setlistData) {
    console.error('Error fetching setlist:', setlistError);
    return {
      _id: '',
      title: title,
      songs: []
    };
  }

  // Get all setlist items (songs and pauses)
  const { data: itemsData, error: itemsError } = await supabase
    .from('setlist_items')
    .select(
      `
      *,
      song:songs(*)
    `
    )
    .eq('setlist_id', setlistData.id)
    .order('position');

  if (itemsError) {
    console.error('Error fetching setlist items:', itemsError);
    return {
      _id: setlistData.id,
      title: setlistData.title,
      songs: []
    };
  }

  const songs = (itemsData || [])
    .map((item) => {
      if (item.item_type === 'song' && item.song) {
        return mapSupabaseSongToSongType(item.song);
      } else if (item.item_type === 'pause') {
        // Create a pause item that looks like a song
        return {
          _id: item.id,
          id: item.id,
          title: item.custom_title || 'Pauze',
          artist: '',
          artwork: '',
          audio: '',
          _type: 'pause',
          dualGuitar: false,
          dualVocal: false,
          notes: '',
          duration: 0,
          version: item.updated_at
        } as SongType;
      }
      return null;
    })
    .filter(Boolean) as SongType[];

  return {
    _id: setlistData.id,
    title: setlistData.title,
    songs
  };
}

export async function getSong(id: string): Promise<SongType | null> {
  const { data, error } = await supabase.from('songs').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching song:', error);
    return null;
  }

  return mapSupabaseSongToSongType(data);
}

export async function getSongWithStats(id: string) {
  // Get song details
  const { data: songData, error: songError } = await supabase.from('songs').select('*').eq('id', id).single();

  if (songError || !songData) {
    console.error('Error fetching song:', songError);
    return null;
  }

  // Get song stats
  const { data: statsData } = await supabase.from('song_stats').select('*').eq('song_id', id).single();

  return {
    song: mapSupabaseSongToSongType(songData),
    stats: statsData || {
      times_played: 0,
      times_practiced: 0,
      mastery_level: 1,
      last_practiced_at: null,
      first_learned_at: null
    }
  };
}

export async function getLyrics(id: string) {
  const { data, error } = await supabase.from('songs').select('title, artist, lyrics').eq('id', id).single();

  if (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }

  return {
    title: data.title,
    artist: data.artist || '',
    lyrics: data.lyrics || ''
  };
}

// New slug-based functions
export async function getSongBySlug(slug: string): Promise<SongType | null> {
  const { data, error } = await supabase.from('songs').select('*').eq('slug', slug).single();

  if (error) {
    console.error('Error fetching song by slug:', error);
    return null;
  }

  return mapSupabaseSongToSongType(data);
}

export async function getSongWithStatsBySlug(slug: string) {
  // Get song details
  const { data: songData, error: songError } = await supabase.from('songs').select('*').eq('slug', slug).single();

  if (songError || !songData) {
    console.error('Error fetching song by slug:', songError);
    return null;
  }

  // Get song stats
  const { data: statsData } = await supabase.from('song_stats').select('*').eq('song_id', songData.id).single();

  return {
    song: mapSupabaseSongToSongType(songData),
    stats: statsData || {
      times_played: 0,
      times_practiced: 0,
      mastery_level: 1,
      last_practiced_at: null,
      first_learned_at: null
    }
  };
}

export async function getLyricsBySlug(slug: string) {
  const { data, error } = await supabase.from('songs').select('id, title, artist, lyrics').eq('slug', slug).single();

  if (error) {
    console.error('Error fetching lyrics by slug:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    artist: data.artist || '',
    lyrics: data.lyrics || ''
  };
}

export async function getGigs(): Promise<GigsType[]> {
  const { data, error } = await supabase.from('gigs').select('*').order('date', { ascending: false });

  if (error) {
    console.error('Error fetching gigs:', error);
    return [];
  }

  return (data || []).map((gig) => ({
    _id: gig.id,
    title: gig.title,
    date: gig.date,
    address: gig.venue_address || '',
    venue: gig.venue_name || '',
    time: gig.start_time || '',
    video_playlist: gig.video_playlist_url || ''
  }));
}

export async function getGig(id: string): Promise<GigType | null> {
  // Get gig with setlist
  const { data: gigData, error: gigError } = await supabase
    .from('gigs')
    .select(
      `
      *,
      setlist:setlists(*)
    `
    )
    .eq('id', id)
    .single();

  if (gigError || !gigData) {
    console.error('Error fetching gig:', gigError);
    return null;
  }

  let setlist: SetlistType | undefined;

  if (gigData.setlist_id) {
    // First get the setlist details if not included in join
    let setlistTitle = gigData.setlist?.title;

    if (!setlistTitle) {
      const { data: setlistData } = await supabase.from('setlists').select('title').eq('id', gigData.setlist_id).single();

      setlistTitle = setlistData?.title || 'Untitled';
    }

    // Get all setlist items (songs and pauses)
    const { data: itemsData, error: itemsError } = await supabase
      .from('setlist_items')
      .select(
        `
        *,
        song:songs(*)
      `
      )
      .eq('setlist_id', gigData.setlist_id)
      .order('position');

    if (itemsError) {
      console.error('Error fetching setlist items:', itemsError);
    }

    if (!itemsError && itemsData) {
      const songs = itemsData
        .map((item) => {
          if (item.item_type === 'song' && item.song) {
            return mapSupabaseSongToSongType(item.song);
          } else if (item.item_type === 'pause') {
            // Create a pause item that looks like a song
            return {
              _id: item.id,
              id: item.id,
              title: item.custom_title || 'Pauze',
              artist: '',
              artwork: '',
              audio: '',
              _type: 'pause',
              dualGuitar: false,
              dualVocal: false,
              notes: '',
              duration: 0,
              version: item.updated_at
            } as SongType;
          }
          return null;
        })
        .filter(Boolean) as SongType[];

      setlist = {
        _id: gigData.setlist_id,
        title: setlistTitle,
        songs
      };
    }
  }

  return {
    _id: gigData.id,
    title: gigData.title,
    date: gigData.date,
    address: gigData.venue_address || '',
    venue: gigData.venue_name || '',
    time: gigData.start_time || '',
    video_playlist: gigData.video_playlist_url || '',
    notes: gigData.notes,
    setlist: setlist || {
      _id: gigData.setlist_id || '',
      title: 'No setlist',
      songs: []
    }
  } as GigType & { notes?: string };
}

export async function getPublicGigs(): Promise<GigsType[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.from('gigs').select('*').gte('date', today).order('date').limit(5);

  if (error) {
    console.error('Error fetching public gigs:', error);
    return [];
  }

  return (data || []).map((gig) => ({
    _id: gig.id,
    title: gig.title,
    date: gig.date,
    address: gig.venue_address || '',
    time: gig.start_time || '',
    venue: gig.venue_name || '',
    video_playlist: gig.video_playlist_url || ''
  }));
}

// Additional helper functions for new features
export async function updateSongStats(songId: string, type: 'played' | 'practiced') {
  const { data: existingStats } = await supabase.from('song_stats').select('*').eq('song_id', songId).single();

  if (existingStats) {
    const updateData = type === 'played' ? { times_played: existingStats.times_played + 1 } : { times_practiced: existingStats.times_practiced + 1, last_practiced_at: new Date().toISOString() };

    await supabase.from('song_stats').update(updateData).eq('song_id', songId);
  } else {
    // Create new stats entry
    await supabase.from('song_stats').insert({
      song_id: songId,
      times_played: type === 'played' ? 1 : 0,
      times_practiced: type === 'practiced' ? 1 : 0,
      last_practiced_at: type === 'practiced' ? new Date().toISOString() : null
    });
  }
}

export async function updateSongMasteryLevel(songId: string, masteryLevel: number) {
  const { data: existingStats } = await supabase.from('song_stats').select('*').eq('song_id', songId).single();

  if (existingStats) {
    const { error } = await supabase
      .from('song_stats')
      .update({ mastery_level: masteryLevel })
      .eq('song_id', songId);

    if (error) {
      console.error('Error updating mastery level:', error);
      throw error;
    }
  } else {
    // Create new stats entry with mastery level
    const { error } = await supabase.from('song_stats').insert({
      song_id: songId,
      times_played: 0,
      times_practiced: 0,
      mastery_level: masteryLevel,
      last_practiced_at: null
    });

    if (error) {
      console.error('Error creating song stats:', error);
      throw error;
    }
  }
}

export async function createGig(gig: Partial<GigsType>) {
  const { data, error } = await supabase
    .from('gigs')
    .insert({
      title: gig.title,
      date: gig.date,
      venue_name: gig.venue,
      venue_address: gig.address,
      start_time: gig.time || null,
      video_playlist_url: gig.video_playlist
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gig:', error);
    throw error;
  }

  return data;
}

export async function createGigWithSetlist(gig: Partial<GigsType> & { notes?: string }) {
  // First create an empty setlist for the gig
  const { data: setlistData, error: setlistError } = await supabase
    .from('setlists')
    .insert({
      title: `Setlist - ${gig.title}`
    })
    .select()
    .single();

  if (setlistError) {
    console.error('Error creating setlist:', setlistError);
    throw setlistError;
  }

  // Then create the gig with the setlist reference
  const { data: gigData, error: gigError } = await supabase
    .from('gigs')
    .insert({
      title: gig.title,
      date: gig.date,
      venue_name: gig.venue,
      venue_address: gig.address,
      start_time: gig.time || null,
      video_playlist_url: gig.video_playlist,
      setlist_id: setlistData.id,
      notes: gig.notes
    })
    .select()
    .single();

  if (gigError) {
    console.error('Error creating gig:', gigError);
    // Try to clean up the setlist if gig creation failed
    await supabase.from('setlists').delete().eq('id', setlistData.id);
    throw gigError;
  }

  return gigData;
}

export async function updateGig(id: string, updates: Partial<GigsType & { notes?: string }>) {
  const updateData: any = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.venue !== undefined) updateData.venue_name = updates.venue;
  if (updates.address !== undefined) updateData.venue_address = updates.address;
  if (updates.time !== undefined) updateData.start_time = updates.time;
  if (updates.video_playlist !== undefined) updateData.video_playlist_url = updates.video_playlist;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase.from('gigs').update(updateData).eq('id', id).select().single();

  if (error) {
    console.error('Error updating gig:', error);
    throw error;
  }

  return data;
}

export async function removeSongFromSetlist(setlistId: string, itemId: string) {
  // Remove the item from setlist_items
  const { error } = await supabase.from('setlist_items').delete().eq('setlist_id', setlistId).eq('id', itemId);

  if (error) {
    console.error('Error removing item from setlist:', error);
    throw error;
  }

  // Reorder remaining items
  const { data: remainingItems, error: fetchError } = await supabase.from('setlist_items').select('id').eq('setlist_id', setlistId).order('position');

  if (!fetchError && remainingItems) {
    for (let i = 0; i < remainingItems.length; i++) {
      await supabase.from('setlist_items').update({ position: i }).eq('id', remainingItems[i].id);
    }
  }
}

export async function updateSetlistSongs(setlistId: string, songs: SongType[]) {
  // Ensure songs is an array
  if (!Array.isArray(songs)) {
    console.error('updateSetlistSongs: songs is not an array:', songs);
    throw new Error('Songs must be an array');
  }

  // Delete all existing items
  await supabase.from('setlist_items').delete().eq('setlist_id', setlistId);

  // Insert new items in order
  const items = songs.map((song, index) => {
    // Check if it's a pause or a song
    if ((song as any)._type === 'pause') {
      return {
        setlist_id: setlistId,
        position: index,
        item_type: 'pause',
        custom_title: song.title
      };
    } else {
      return {
        setlist_id: setlistId,
        song_id: song._id,
        position: index,
        item_type: 'song'
      };
    }
  });

  const { error } = await supabase.from('setlist_items').insert(items);

  if (error) {
    console.error('Error updating setlist songs:', error);
    throw error;
  }
}

export async function modifyLyrics(songId: string, lyrics: string) {
  const { error } = await supabase.from('songs').update({ lyrics }).eq('id', songId);

  if (error) {
    console.error('Error updating lyrics:', error);
    throw error;
  }
}

export async function markSongPracticed(songId: string) {
  const { error } = await supabase.rpc('mark_song_practiced', { p_song_id: songId });
  
  if (error) {
    console.error('Error marking song as practiced:', error);
    throw error;
  }
}

export async function getSongLinks(songId: string) {
  const { data, error } = await supabase
    .from('song_links')
    .select('*')
    .eq('song_id', songId)
    .order('link_type');
  
  if (error) {
    console.error('Error fetching song links:', error);
    throw error;
  }
  
  return data;
}

export async function createSongLink(songId: string, link: { link_type: string; url: string; title?: string }) {
  const { data, error } = await supabase
    .from('song_links')
    .insert({
      song_id: songId,
      ...link
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating song link:', error);
    throw error;
  }
  
  return data;
}

export async function updateSongLink(linkId: string, updates: any) {
  const { data, error } = await supabase
    .from('song_links')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating song link:', error);
    throw error;
  }
  
  return data;
}

export async function deleteSongLink(linkId: string) {
  const { error } = await supabase
    .from('song_links')
    .delete()
    .eq('id', linkId);
  
  if (error) {
    console.error('Error deleting song link:', error);
    throw error;
  }
}

export async function updateSong(
  songId: string,
  updates: {
    key_signature?: string;
    tempo_bpm?: number;
    notes?: string;
    tabs_chords?: string;
    tags?: string[];
    dual_guitar?: boolean;
    dual_vocal?: boolean;
  }
) {
  const updateData: any = {};

  if (updates.key_signature !== undefined) updateData.key_signature = updates.key_signature;
  if (updates.tempo_bpm !== undefined) updateData.tempo_bpm = updates.tempo_bpm;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.tabs_chords !== undefined) updateData.tabs_chords = updates.tabs_chords;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.dual_guitar !== undefined) updateData.dual_guitar = updates.dual_guitar;
  if (updates.dual_vocal !== undefined) updateData.dual_vocal = updates.dual_vocal;

  const { error } = await supabase.from('songs').update(updateData).eq('id', songId);

  if (error) {
    console.error('Error updating song:', error);
    throw error;
  }
}

export async function addPause(pause: SongType, setlist: SetlistType) {
  // Get the max position in the setlist
  const { data: maxPosData } = await supabase.from('setlist_items').select('position').eq('setlist_id', setlist._id).order('position', { ascending: false }).limit(1);

  const nextPosition = ((maxPosData && maxPosData[0]?.position) || -1) + 1;

  // Add pause item to setlist
  const { error } = await supabase.from('setlist_items').insert({
    setlist_id: setlist._id,
    position: nextPosition,
    item_type: 'pause',
    custom_title: pause.title
  });

  if (error) {
    console.error('Error adding pause:', error);
    throw error;
  }
}

export async function createSong(songData: {
  title: string;
  artist: string;
  artwork_url?: string;
  audio_url?: string;
  duration_seconds?: number;
}) {
  const { data, error } = await supabase
    .from('songs')
    .insert({
      title: songData.title,
      artist: songData.artist,
      slug: generateSlug(songData.title),
      artwork_url: songData.artwork_url || null,
      audio_url: songData.audio_url || null,
      duration_seconds: songData.duration_seconds || null,
      dual_guitar: false,
      dual_vocal: false,
      lyrics: null,
      key_signature: null,
      tempo_bpm: null,
      tags: [],
      notes: null,
      tabs_chords: null,
      last_played_at: null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating song:', error);
    throw error;
  }

  return mapSupabaseSongToSongType(data);
}

export async function deleteSong(songId: string) {
  try {
    // Get song data first to access file URLs for cleanup
    const { data: songData } = await supabase
      .from('songs')
      .select('artwork_url, audio_url, title')
      .eq('id', songId)
      .single();

    // 1. Delete from setlist_items (remove from all playlists)
    const { error: setlistItemsError } = await supabase
      .from('setlist_items')
      .delete()
      .eq('song_id', songId);

    if (setlistItemsError) {
      console.error('Error deleting setlist items:', setlistItemsError);
    }

    // 2. Delete song_links
    const { error: linksError } = await supabase
      .from('song_links')
      .delete()
      .eq('song_id', songId);

    if (linksError) {
      console.error('Error deleting song links:', linksError);
    }

    // 3. Delete song_stats
    const { error: statsError } = await supabase
      .from('song_stats')
      .delete()
      .eq('song_id', songId);

    if (statsError) {
      console.error('Error deleting song stats:', statsError);
    }

    // 4. Delete practice_session_songs if it exists
    try {
      const { error: practiceError } = await supabase
        .from('practice_session_songs')
        .delete()
        .eq('song_id', songId);

      if (practiceError) {
        console.error('Error deleting practice session songs:', practiceError);
      }
    } catch (e) {
      // Table might not exist, ignore
    }

    // 5. Delete the song itself
    const { error: songError } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (songError) {
      console.error('Error deleting song:', songError);
      throw songError;
    }

    // 6. Delete files (artwork and audio)
    if (songData) {
      const filesToDelete = [];
      
      if (songData.artwork_url && songData.artwork_url.startsWith('/uploads/')) {
        filesToDelete.push({ type: 'cover', url: songData.artwork_url });
      }
      
      if (songData.audio_url && songData.audio_url.startsWith('/uploads/')) {
        filesToDelete.push({ type: 'audio', url: songData.audio_url });
      }

      // Call delete files API if there are files to delete
      if (filesToDelete.length > 0) {
        try {
          await fetch('/api/delete-files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: filesToDelete })
          });
        } catch (e) {
          console.error('Error deleting files:', e);
          // Don't throw - files can be cleaned up manually
        }
      }
    }

    console.log(`Successfully deleted song: ${songData?.title}`);
    return true;

  } catch (error) {
    console.error('Error in deleteSong:', error);
    throw error;
  }
}

export async function getProposals(): Promise<ProposalType[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }

  return (data || []).map((proposal) => ({
    _id: proposal.id,
    band: proposal.band || '',
    title: proposal.title || '',
    album: proposal.album || '',
    coverart: proposal.coverart || '',
    created_at: proposal.created_at,
    uri: proposal.uri || null
  }));
}

export async function getPublicSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('title, artist')
    .order('artist', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching public songs', error);
    return [];
  }

  return data || [];
}

