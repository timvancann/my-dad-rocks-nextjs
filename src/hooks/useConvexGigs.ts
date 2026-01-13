"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Gig Queries
// ============================================

export function useGigs() {
  return useQuery(api.gigs.getAll);
}

export function useGig(id: Id<"gigs"> | undefined) {
  return useQuery(api.gigs.getById, id ? { id } : "skip");
}

export function useUpcomingGigs(limit?: number) {
  return useQuery(api.gigs.getUpcoming, { limit });
}

export function usePastGigs(limit?: number) {
  return useQuery(api.gigs.getPast, { limit });
}

// ============================================
// Gig Mutations
// ============================================

export function useCreateGig() {
  return useMutation(api.gigs.create);
}

export function useCreateGigWithSetlist() {
  return useMutation(api.gigs.createWithSetlist);
}

export function useUpdateGig() {
  return useMutation(api.gigs.update);
}

export function useDeleteGig() {
  return useMutation(api.gigs.remove);
}
