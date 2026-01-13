"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// ============================================
// Checklist Queries
// ============================================

export function useChecklistItems(userEmail: string | undefined) {
  return useQuery(
    api.checklistItems.getByUserEmail,
    userEmail ? { userEmail } : "skip"
  );
}

// ============================================
// Checklist Mutations
// ============================================

export function useCreateChecklistItem() {
  return useMutation(api.checklistItems.create);
}

export function useUpdateChecklistItem() {
  return useMutation(api.checklistItems.update);
}

export function useToggleChecklistItem() {
  return useMutation(api.checklistItems.toggle);
}

export function useDeleteChecklistItem() {
  return useMutation(api.checklistItems.remove);
}

export function useReorderChecklistItems() {
  return useMutation(api.checklistItems.reorder);
}

export function useClearCompletedChecklistItems() {
  return useMutation(api.checklistItems.clearCompleted);
}
