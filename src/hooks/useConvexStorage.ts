"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================
// Storage Queries
// ============================================

export function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.storage.getUrl, storageId ? { storageId } : "skip");
}

// ============================================
// Storage Mutations
// ============================================

export function useGenerateUploadUrl() {
  return useMutation(api.storage.generateUploadUrl);
}

export function useDeleteFile() {
  return useMutation(api.storage.deleteFile);
}

export function useDeleteFiles() {
  return useMutation(api.storage.deleteFiles);
}

// ============================================
// File Upload Hook
// ============================================

export function useFileUpload() {
  const generateUploadUrl = useGenerateUploadUrl();

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    // Get upload URL
    const uploadUrl = await generateUploadUrl();

    // Upload file to Convex storage
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error(`Failed to upload file: ${result.statusText}`);
    }

    const { storageId } = await result.json();
    return storageId as Id<"_storage">;
  };

  return { uploadFile };
}

// ============================================
// Multi-file Upload Hook
// ============================================

export function useMultiFileUpload() {
  const generateUploadUrl = useGenerateUploadUrl();

  const uploadFiles = async (files: File[]): Promise<Id<"_storage">[]> => {
    const storageIds: Id<"_storage">[] = [];

    for (const file of files) {
      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Failed to upload file: ${result.statusText}`);
      }

      const { storageId } = await result.json();
      storageIds.push(storageId as Id<"_storage">);
    }

    return storageIds;
  };

  return { uploadFiles };
}
