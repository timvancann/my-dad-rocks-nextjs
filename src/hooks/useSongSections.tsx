'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/store';
import { SongSection, CreateSongSectionData, UpdateSongSectionData } from '@/types/song-section';
import { getSongSections, createSongSection, updateSongSection, deleteSongSection } from '@/actions/song-sections';

export function useSongSections() {
  const { currentSong, songSections, setSongSections } = usePlayerStore();
  const [loading, setLoading] = useState(false);
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);

  const loadSections = async (songId: string) => {
    setLoading(true);
    try {
      const sections = await getSongSections(songId);
      setSongSections(sections);
    } catch (error) {
      console.error('Failed to load song sections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSong?._id) {
      loadSections(currentSong._id);
    } else {
      setSongSections([]);
    }
  }, [currentSong?._id, setSongSections]);

  const addSection = async (name: string, startTime: number, color?: string) => {
    if (!currentSong?._id) return;

    try {
      const newSection = await createSongSection({
        song_id: currentSong._id,
        name,
        start_time: startTime,
        color
      });
      
      setSongSections([...songSections, newSection]);
      return newSection;
    } catch (error) {
      console.error('Failed to create song section:', error);
      throw error;
    }
  };

  const updateSection = async (id: string, updates: UpdateSongSectionData) => {
    try {
      const updatedSection = await updateSongSection(id, updates);
      
      setSongSections(
        songSections.map(section => 
          section.id === id ? updatedSection : section
        )
      );
      
      return updatedSection;
    } catch (error) {
      console.error('Failed to update song section:', error);
      throw error;
    }
  };

  const removeSection = async (id: string) => {
    try {
      await deleteSongSection(id);
      setSongSections(songSections.filter(section => section.id !== id));
    } catch (error) {
      console.error('Failed to delete song section:', error);
      throw error;
    }
  };

  const jumpToSection = (section: SongSection): void => {
    const event = new CustomEvent('seekTo', { detail: section.start_time });
    window.dispatchEvent(event);
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