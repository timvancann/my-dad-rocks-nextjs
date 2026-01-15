'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/store';
import { SongSection } from '@/types/song-section';
import { useSongSections as useConvexSongSections, useCreateSongSection, useUpdateSongSection, useDeleteSongSection } from '@/hooks/convex';
import type { Id } from '../../convex/_generated/dataModel';

export function useSongSections() {
  const { currentSong, songSections, setSongSections } = usePlayerStore();
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);

  // Convex hooks
  const convexSections = useConvexSongSections(currentSong?._id as Id<"songs"> | undefined);
  const createSectionMutation = useCreateSongSection();
  const updateSectionMutation = useUpdateSongSection();
  const deleteSectionMutation = useDeleteSongSection();

  const loading = convexSections === undefined && !!currentSong?._id;

  // Sync Convex data to store when it changes
  useEffect(() => {
    if (convexSections) {
      // Transform Convex sections to match the expected format
      const transformedSections: SongSection[] = convexSections.map(section => ({
        id: section._id,
        song_id: section.songId,
        name: section.name,
        start_time: section.startTime,
        end_time: null,
        color: section.color ?? '#6366f1',
        position: section.position ?? 0,
        created_at: section._creationTime?.toString() ?? new Date().toISOString(),
        updated_at: section._creationTime?.toString() ?? new Date().toISOString(),
      }));
      // Sort sections by start_time
      const sortedSections = transformedSections.sort((a, b) => a.start_time - b.start_time);
      setSongSections(sortedSections);
    } else if (!currentSong?._id) {
      setSongSections([]);
    }
  }, [convexSections, currentSong?._id, setSongSections]);

  const addSection = async (name: string, startTime: number, color?: string) => {
    if (!currentSong?._id) return;

    try {
      const newSectionId = await createSectionMutation({
        songId: currentSong._id as Id<"songs">,
        name,
        startTime,
        color,
      });

      // Convex will automatically update the query, triggering the useEffect above
      return { id: newSectionId, name };
    } catch (error) {
      console.error('Failed to create song section:', error);
      throw error;
    }
  };

  const updateSection = async (id: string, updates: { name?: string; start_time?: number; color?: string }) => {
    try {
      await updateSectionMutation({
        id: id as Id<"songSections">,
        name: updates.name,
        startTime: updates.start_time,
        color: updates.color,
      });

      // Convex will automatically update the query
      return { id };
    } catch (error) {
      console.error('Failed to update song section:', error);
      throw error;
    }
  };

  const removeSection = async (id: string) => {
    try {
      await deleteSectionMutation({ id: id as Id<"songSections"> });
      // Convex will automatically update the query
    } catch (error) {
      console.error('Failed to delete song section:', error);
      throw error;
    }
  };

  const jumpToSection = (section: SongSection): void => {
    const event = new CustomEvent('seekTo', { detail: section.start_time });
    window.dispatchEvent(event);
  };

  // For compatibility with existing code that may call loadSections
  const loadSections = async (_songId: string) => {
    // No-op - Convex handles this reactively
  };

  return {
    sections: songSections,
    loading,
    editingMarkerId,
    setEditingMarkerId,
    addSection,
    updateSection,
    removeSection,
    jumpToSection,
    loadSections
  };
}
