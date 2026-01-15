"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Band Member Queries
// ============================================

export function useBandMembers() {
  return useQuery(api.bandMembers.getAll);
}

export function useBandMember(id: Id<"bandMembers"> | undefined) {
  return useQuery(api.bandMembers.getById, id ? { id } : "skip");
}

export function useBandMemberByEmail(email: string | undefined) {
  return useQuery(api.bandMembers.getByEmail, email ? { email } : "skip");
}

export function useBandMemberByUserId(userId: Id<"users"> | undefined) {
  return useQuery(api.bandMembers.getByUserId, userId ? { userId } : "skip");
}

// ============================================
// Band Member Mutations
// ============================================

export function useCreateBandMember() {
  return useMutation(api.bandMembers.create);
}

export function useUpdateBandMember() {
  return useMutation(api.bandMembers.update);
}

export function useEnsureBandMember() {
  return useMutation(api.bandMembers.ensureByEmail);
}

export function useLinkBandMemberToUser() {
  return useMutation(api.bandMembers.linkToUser);
}

export function useDeleteBandMember() {
  return useMutation(api.bandMembers.remove);
}
