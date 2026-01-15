"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Song Queries
// ============================================

export function useSongs() {
  return useQuery(api.songs.getAll);
}

export function useSong(id: Id<"songs"> | undefined) {
  return useQuery(api.songs.getById, id ? { id } : "skip");
}

export function useSongBySlug(slug: string | undefined) {
  return useQuery(api.songs.getBySlug, slug ? { slug } : "skip");
}

export function useSongWithDetails(slug: string | undefined) {
  return useQuery(api.songs.getWithDetails, slug ? { slug } : "skip");
}

export function useSongLinks(songId: Id<"songs"> | undefined) {
  return useQuery(api.songs.getLinks, songId ? { songId } : "skip");
}

export function useSongSections(songId: Id<"songs"> | undefined) {
  return useQuery(api.songs.getSections, songId ? { songId } : "skip");
}

export function useSongAudioCues(songId: Id<"songs"> | undefined) {
  return useQuery(api.songs.getAudioCues, songId ? { songId } : "skip");
}

// ============================================
// Song Mutations
// ============================================

export function useCreateSong() {
  return useMutation(api.songs.create);
}

export function useUpdateSong() {
  return useMutation(api.songs.update);
}

export function useUpdateLyrics() {
  return useMutation(api.songs.updateLyrics);
}

export function useMarkPracticed() {
  return useMutation(api.songs.markPracticed);
}

export function useMarkPlayed() {
  return useMutation(api.songs.markPlayed);
}

export function useUpdateMasteryLevel() {
  return useMutation(api.songs.updateMasteryLevel);
}

export function useDeleteSong() {
  return useMutation(api.songs.remove);
}

// ============================================
// Song Link Mutations
// ============================================

export function useCreateSongLink() {
  return useMutation(api.songs.createLink);
}

export function useUpdateSongLink() {
  return useMutation(api.songs.updateLink);
}

export function useDeleteSongLink() {
  return useMutation(api.songs.deleteLink);
}

// ============================================
// Song Section Mutations
// ============================================

export function useCreateSongSection() {
  return useMutation(api.songs.createSection);
}

export function useUpdateSongSection() {
  return useMutation(api.songs.updateSection);
}

export function useDeleteSongSection() {
  return useMutation(api.songs.deleteSection);
}

// ============================================
// Song Audio Cue Mutations
// ============================================

export function useCreateAudioCue() {
  return useMutation(api.songs.createAudioCue);
}

export function useUpdateAudioCue() {
  return useMutation(api.songs.updateAudioCue);
}

export function useDeleteAudioCue() {
  return useMutation(api.songs.deleteAudioCue);
}
