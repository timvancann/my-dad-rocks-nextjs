'use server';

import { supabase } from '@/lib/supabase';
import { CreateSongSectionData, SongSection, UpdateSongSectionData } from '@/types/song-section';

export async function getSongSections(songId: string): Promise<SongSection[]> {
  const { data, error } = await supabase
    .from('song_sections')
    .select('*')
    .eq('song_id', songId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching song sections:', error);
    throw new Error('Failed to fetch song sections');
  }

  return data || [];
}

export async function createSongSection(sectionData: CreateSongSectionData): Promise<SongSection> {
  // Get the next position for this song
  const { data: existingSections } = await supabase
    .from('song_sections')
    .select('position')
    .eq('song_id', sectionData.song_id)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingSections && existingSections.length > 0 
    ? existingSections[0].position + 1 
    : 0;

  const { data, error } = await supabase
    .from('song_sections')
    .insert({
      ...sectionData,
      position: sectionData.position ?? nextPosition,
      color: sectionData.color ?? '#6366f1'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating song section:', error);
    throw new Error('Failed to create song section');
  }

  return data;
}

export async function updateSongSection(id: string, updates: UpdateSongSectionData): Promise<SongSection> {
  const { data, error } = await supabase
    .from('song_sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating song section:', error);
    throw new Error('Failed to update song section');
  }

  return data;
}

export async function deleteSongSection(id: string): Promise<void> {
  const { error } = await supabase
    .from('song_sections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting song section:', error);
    throw new Error('Failed to delete song section');
  }
}

export async function reorderSongSections(sectionUpdates: { id: string; position: number }[]): Promise<void> {
  // Batch update positions
  const updates = sectionUpdates.map(({ id, position }) => 
    supabase
      .from('song_sections')
      .update({ position })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    console.error('Error reordering song sections:', errors);
    throw new Error('Failed to reorder song sections');
  }
}