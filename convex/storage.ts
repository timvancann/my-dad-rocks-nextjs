import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// File Upload
// ============================================

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ============================================
// File Retrieval
// ============================================

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.storageIds.map((id) => ctx.storage.getUrl(id))
    );
  },
});

// ============================================
// File Deletion
// ============================================

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

export const deleteFiles = mutation({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    await Promise.all(args.storageIds.map((id) => ctx.storage.delete(id)));
  },
});
