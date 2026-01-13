"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Proposal Queries
// ============================================

export function useProposals() {
  return useQuery(api.proposals.getAll);
}

export function useProposal(id: Id<"proposals"> | undefined) {
  return useQuery(api.proposals.getById, id ? { id } : "skip");
}

// ============================================
// Proposal Mutations
// ============================================

export function useCreateProposal() {
  return useMutation(api.proposals.create);
}

export function useCreateProposalWithVote() {
  return useMutation(api.proposals.createWithVote);
}

export function useDeleteProposal() {
  return useMutation(api.proposals.remove);
}

// ============================================
// Vote Mutations
// ============================================

export function useVote() {
  return useMutation(api.proposals.vote);
}

export function useRemoveVote() {
  return useMutation(api.proposals.removeVote);
}
