import { createClient } from '@supabase/supabase-js';
import { GigsType, GigType, SetlistType, SongType, ProposalType, BandMember, ProposalVoteStatus, ProposalVote } from './interface';
import { supabase } from './supabase';

const supabaseServiceKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseService = supabaseServiceKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

type StorageFileTarget = { bucket: 'artwork' | 'songs'; path: string };

function parseStorageUrl(url: string): StorageFileTarget | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const publicIndex = segments.findIndex(segment => segment === 'public');

    if (publicIndex === -1 || publicIndex + 2 >= segments.length) {
      return null;
    }

    const bucket = segments[publicIndex + 1];

    if (bucket !== 'artwork' && bucket !== 'songs') {
      return null;
    }

    const path = decodeURIComponent(segments.slice(publicIndex + 2).join('/'));

    return { bucket, path };
  } catch (error) {
    console.error('Failed to parse storage URL:', error);
    return null;
  }
}

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

  const { data: cueData, error: cueError } = await supabase
    .from('song_audio_cues')
    .select('*')
    .eq('song_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (cueError) {
    console.error('Error fetching song audio cues:', cueError);
  }

  return {
    song: mapSupabaseSongToSongType(songData),
    stats: statsData || {
      times_played: 0,
      times_practiced: 0,
      mastery_level: 1,
      last_practiced_at: null,
      first_learned_at: null
    },
    audioCues: cueData || []
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

  const { data: cueData, error: cueError } = await supabase
    .from('song_audio_cues')
    .select('*')
    .eq('song_id', songData.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (cueError) {
    console.error('Error fetching song audio cues:', cueError);
  }

  return {
    song: mapSupabaseSongToSongType(songData),
    stats: statsData || {
      times_played: 0,
      times_practiced: 0,
      mastery_level: 1,
      last_practiced_at: null,
      first_learned_at: null
    },
    audioCues: cueData || []
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

export async function getSongAudioCues(songId: string) {
  const { data, error } = await supabase
    .from('song_audio_cues')
    .select('*')
    .eq('song_id', songId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching song audio cues:', error);
    throw error;
  }

  return data || [];
}

export async function createSongAudioCue(
  songId: string,
  cue: { title: string; cue_url: string; description?: string | null; duration_seconds?: number | null }
) {
  const { data: maxOrderData } = await supabase
    .from('song_audio_cues')
    .select('sort_order')
    .eq('song_id', songId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = ((maxOrderData && maxOrderData[0]?.sort_order) ?? -1) + 1;

  const insertPayload = {
    song_id: songId,
    title: cue.title,
    cue_url: cue.cue_url,
    description: cue.description || null,
    duration_seconds: cue.duration_seconds ?? null,
    sort_order: nextOrder
  };

  const { data, error } = await supabase
    .from('song_audio_cues')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating song audio cue:', error);
    throw error;
  }

  return data;
}

export async function updateSongAudioCue(
  cueId: string,
  updates: { title?: string; description?: string | null; duration_seconds?: number | null; sort_order?: number | null }
) {
  const payload: Record<string, any> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.duration_seconds !== undefined) payload.duration_seconds = updates.duration_seconds;
  if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;

  if (Object.keys(payload).length === 0) {
    const { data } = await supabase.from('song_audio_cues').select('*').eq('id', cueId).single();
    return data;
  }

  const { data, error } = await supabase
    .from('song_audio_cues')
    .update(payload)
    .eq('id', cueId)
    .select()
    .single();

  if (error) {
    console.error('Error updating song audio cue:', error);
    throw error;
  }

  return data;
}

export async function deleteSongAudioCue(cueId: string) {
  const { error } = await supabase
    .from('song_audio_cues')
    .delete()
    .eq('id', cueId);

  if (error) {
    console.error('Error deleting song audio cue:', error);
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
      const filesToDelete: StorageFileTarget[] = [];

      if (songData.artwork_url) {
        const parsed = parseStorageUrl(songData.artwork_url);
        if (parsed) {
          filesToDelete.push(parsed);
        }
      }

      if (songData.audio_url) {
        const parsed = parseStorageUrl(songData.audio_url);
        if (parsed) {
          filesToDelete.push(parsed);
        }
      }

      if (filesToDelete.length > 0) {
        if (!supabaseService) {
          console.warn('Supabase service client not configured; skipping storage cleanup.', filesToDelete);
        } else {
          const pathsByBucket = filesToDelete.reduce<Record<'artwork' | 'songs', string[]>>(
            (acc, file) => {
              acc[file.bucket].push(file.path);
              return acc;
            },
            { artwork: [], songs: [] }
          );

          await Promise.all(
            (Object.entries(pathsByBucket) as [keyof typeof pathsByBucket, string[]][])
              .filter(([, paths]) => paths.length > 0)
              .map(async ([bucket, paths]) => {
                const { error: storageError } = await supabaseService
                  .storage
                  .from(bucket)
                  .remove(paths);

                if (storageError) {
                  console.error(`Error deleting files from ${bucket} bucket:`, storageError);
                }
              })
          );
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

export async function getProposals(): Promise<{ proposals: ProposalType[]; bandMembers: BandMember[] }> {
  const client = supabaseService ?? supabase;

  const [bandMembersResult, proposalsResult] = await Promise.all([
    client
      .from('band_members')
      .select('*')
      .order('name', { ascending: true }),
    client
      .from('proposals')
      .select('id, band, album, title, coverart, created_at, uri, created_by, proposal_votes (band_member_id, status)')
      .order('created_at', { ascending: false })
  ]);

  if (bandMembersResult.error) {
    console.error('Error fetching band members:', bandMembersResult.error);
  }

  if (proposalsResult.error) {
    console.error('Error fetching proposals:', proposalsResult.error);
  }

  const bandMembers: BandMember[] = (bandMembersResult.data ?? []).map((member: any) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    avatarUrl: member.avatar_url ?? null,
  }));

  const proposals: ProposalType[] = (proposalsResult.data ?? []).map((proposal: any) => {
    const rawVotes = Array.isArray(proposal.proposal_votes) ? proposal.proposal_votes : [];

    const votes = rawVotes
      .filter((vote: any) => vote?.band_member_id && vote?.status)
      .map((vote: any) => ({
        bandMemberId: vote.band_member_id as string,
        status: (vote.status as ProposalVoteStatus)
      }))
      .filter((vote: { bandMemberId: string; status: ProposalVoteStatus }) => vote.status === 'accepted' || vote.status === 'rejected');

    return {
      _id: proposal.id,
      band: proposal.band || '',
      title: proposal.title || '',
      album: proposal.album || '',
      coverart: proposal.coverart || '',
      created_at: proposal.created_at,
      uri: proposal.uri || null,
      createdBy: proposal.created_by ?? null,
      votes
    } satisfies ProposalType;
  });

  return { bandMembers, proposals };
}

export async function ensureBandMemberAvatar(
  email: string,
  avatarUrl?: string | null,
  displayName?: string | null
): Promise<{ id: string; avatarUrl: string | null } | null> {
  if (!email) {
    return null;
  }

  const client = supabaseService ?? supabase;
  const normalizedEmail = email.toLowerCase();

  const { data, error } = await client
    .from('band_members')
    .select('id, avatar_url, email, name')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Error fetching band member for avatar sync:', error);
    return null;
  }

  if (!data) {
    const insertPayload: Record<string, any> = {
      email: normalizedEmail,
      name: displayName ?? null,
      avatar_url: avatarUrl ?? null,
      role: 'member'
    };

    const { data: inserted, error: insertError } = await client
      .from('band_members')
      .insert(insertPayload)
      .select('id, avatar_url')
      .single();

    if (insertError) {
      console.error('Error inserting band member for avatar sync:', insertError);
      return null;
    }

    return {
      id: inserted.id as string,
      avatarUrl: (inserted.avatar_url as string | null) ?? null
    };
  }

  const currentAvatar = (data.avatar_url as string | null) ?? null;
  const shouldUpdateAvatar = Boolean(avatarUrl) && currentAvatar !== avatarUrl;
  const shouldUpdateName = Boolean(displayName) && displayName !== data.name;

  if (!shouldUpdateAvatar && !shouldUpdateName) {
    return {
      id: data.id as string,
      avatarUrl: currentAvatar
    };
  }

  const updatePayload: Record<string, any> = {};

  if (shouldUpdateAvatar) {
    updatePayload.avatar_url = avatarUrl;
  }

  if (shouldUpdateName) {
    updatePayload.name = displayName;
  }

  const { data: updated, error: updateError } = await client
    .from('band_members')
    .update(updatePayload)
    .eq('id', data.id)
    .select('id, avatar_url')
    .maybeSingle();

  if (updateError) {
    console.error('Error updating band member avatar:', updateError);
    return {
      id: data.id as string,
      avatarUrl: currentAvatar
    };
  }

  return {
    id: (updated?.id ?? data.id) as string,
    avatarUrl: (updated?.avatar_url as string | null) ?? (avatarUrl ?? currentAvatar)
  };
}

export async function createProposal(proposal: {
  title: string;
  band: string;
  album?: string;
  coverart?: string;
  uri?: string;
  createdBy?: string;
  seedVote?: boolean;
}): Promise<ProposalType> {
  const client = supabaseService ?? supabase;

  const { data, error } = await client
    .from('proposals')
    .insert({
      title: proposal.title,
      band: proposal.band,
      album: proposal.album ?? null,
      coverart: proposal.coverart ?? null,
      uri: proposal.uri ?? null,
      created_by: proposal.createdBy ?? null
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }

  const votes: ProposalVote[] = [];

  if (proposal.seedVote && proposal.createdBy) {
    const { error: voteError } = await client
      .from('proposal_votes')
      .upsert({
        proposal_id: data.id,
        band_member_id: proposal.createdBy,
        status: 'accepted'
      }, { onConflict: 'proposal_id,band_member_id' });

    if (voteError) {
      console.error('Error seeding proposal vote:', voteError);
    } else {
      votes.push({ bandMemberId: proposal.createdBy, status: 'accepted' });
    }
  }

  return {
    _id: data.id,
    band: data.band || '',
    title: data.title || '',
    album: data.album || '',
    coverart: data.coverart || '',
    created_at: data.created_at,
    uri: data.uri || null,
    createdBy: data.created_by ?? null,
    votes
  };
}

export async function deleteProposal(id: string): Promise<void> {
  const client = supabaseService ?? supabase;

  const { error } = await client
    .from('proposals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
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
