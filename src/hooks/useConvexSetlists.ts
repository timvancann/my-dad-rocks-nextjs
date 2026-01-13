"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Setlist Queries
// ============================================

export function useSetlists() {
  return useQuery(api.setlists.getAll);
}

export function useSetlist(id: Id<"setlists"> | undefined) {
  return useQuery(api.setlists.getById, id ? { id } : "skip");
}

export function useSetlistByTitle(title: string | undefined) {
  return useQuery(api.setlists.getByTitle, title ? { title } : "skip");
}

export function useSetlistWithItems(id: Id<"setlists"> | undefined) {
  return useQuery(api.setlists.getWithItems, id ? { id } : "skip");
}

// ============================================
// Setlist Mutations
// ============================================

export function useCreateSetlist() {
  return useMutation(api.setlists.create);
}

export function useUpdateSetlist() {
  return useMutation(api.setlists.update);
}

export function useDeleteSetlist() {
  return useMutation(api.setlists.remove);
}

// ============================================
// Setlist Item Mutations
// ============================================

export function useAddSetlistItem() {
  return useMutation(api.setlists.addItem);
}

export function useUpdateSetlistItem() {
  return useMutation(api.setlists.updateItem);
}

export function useRemoveSetlistItem() {
  return useMutation(api.setlists.removeItem);
}

export function useUpdateSetlistItems() {
  return useMutation(api.setlists.updateItems);
}

export function useReorderSetlistItems() {
  return useMutation(api.setlists.reorderItems);
}
