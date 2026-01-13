"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Practice Session Queries
// ============================================

export function usePracticeSessions() {
  return useQuery(api.practiceSessions.getAll);
}

export function usePracticeSession(id: Id<"practiceSessions"> | undefined) {
  return useQuery(api.practiceSessions.getById, id ? { id } : "skip");
}

export function useRecentPracticeSessions(limit?: number) {
  return useQuery(api.practiceSessions.getRecent, { limit });
}

// ============================================
// Practice Session Mutations
// ============================================

export function useCreatePracticeSession() {
  return useMutation(api.practiceSessions.create);
}

export function useUpdatePracticeSession() {
  return useMutation(api.practiceSessions.update);
}

export function useDeletePracticeSession() {
  return useMutation(api.practiceSessions.remove);
}

// ============================================
// Practice Session Song Mutations
// ============================================

export function useAddPracticeSessionSong() {
  return useMutation(api.practiceSessions.addSong);
}

export function useUpdatePracticeSessionSong() {
  return useMutation(api.practiceSessions.updateSong);
}

export function useRemovePracticeSessionSong() {
  return useMutation(api.practiceSessions.removeSong);
}
