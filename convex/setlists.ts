import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("setlists").order("asc").collect();
  },
});

export const getById = query({
  args: { id: v.id("setlists") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByTitle = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const setlist = await ctx.db
      .query("setlists")
      .withIndex("by_title", (q) => q.eq("title", args.title))
      .unique();

    if (!setlist) return null;

    const items = await ctx.db
      .query("setlistItems")
      .withIndex("by_setlistId", (q) => q.eq("setlistId", setlist._id))
      .collect();

    // Sort by position
    items.sort((a, b) => a.position - b.position);

    // Fetch songs for each item
    const itemsWithSongs = await Promise.all(
      items.map(async (item) => {
        if (!item.songId) return { ...item, song: null };
        const song = await ctx.db.get(item.songId);
        if (!song) return { ...item, song: null };

        // Get URLs for storage IDs
        const audioUrl = song.audioStorageId
          ? await ctx.storage.getUrl(song.audioStorageId)
          : song.audioUrl;
        const artworkUrl = song.artworkStorageId
          ? await ctx.storage.getUrl(song.artworkStorageId)
          : song.artworkUrl;

        return { ...item, song: { ...song, audioUrl, artworkUrl } };
      })
    );

    return {
      ...setlist,
      items: itemsWithSongs,
    };
  },
});

export const getWithItems = query({
  args: { id: v.id("setlists") },
  handler: async (ctx, args) => {
    const setlist = await ctx.db.get(args.id);
    if (!setlist) return null;

    const items = await ctx.db
      .query("setlistItems")
      .withIndex("by_setlistId", (q) => q.eq("setlistId", args.id))
      .collect();

    // Sort by position
    items.sort((a, b) => a.position - b.position);

    // Fetch songs for each item
    const itemsWithSongs = await Promise.all(
      items.map(async (item) => {
        if (!item.songId) return { ...item, song: null };
        const song = await ctx.db.get(item.songId);
        if (!song) return { ...item, song: null };

        const audioUrl = song.audioStorageId
          ? await ctx.storage.getUrl(song.audioStorageId)
          : song.audioUrl;
        const artworkUrl = song.artworkStorageId
          ? await ctx.storage.getUrl(song.artworkStorageId)
          : song.artworkUrl;

        return { ...item, song: { ...song, audioUrl, artworkUrl } };
      })
    );

    return {
      ...setlist,
      items: itemsWithSongs,
    };
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
  args: {
    title: v.string(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    totalDurationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("setlists", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("setlists"),
    title: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    totalDurationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("setlists") },
  handler: async (ctx, args) => {
    // Delete all items first
    const items = await ctx.db
      .query("setlistItems")
      .withIndex("by_setlistId", (q) => q.eq("setlistId", args.id))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    // Delete setlist
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Setlist Items
// ============================================

export const addItem = mutation({
  args: {
    setlistId: v.id("setlists"),
    songId: v.optional(v.id("songs")),
    itemType: v.union(
      v.literal("song"),
      v.literal("pause"),
      v.literal("announcement"),
      v.literal("intro"),
      v.literal("outro")
    ),
    customTitle: v.optional(v.string()),
    customDurationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // If position not provided, add to end
    let position = args.position;
    if (position === undefined) {
      const items = await ctx.db
        .query("setlistItems")
        .withIndex("by_setlistId", (q) => q.eq("setlistId", args.setlistId))
        .collect();
      position = items.length;
    }

    return await ctx.db.insert("setlistItems", {
      ...args,
      position,
    });
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("setlistItems"),
    songId: v.optional(v.id("songs")),
    itemType: v.optional(
      v.union(
        v.literal("song"),
        v.literal("pause"),
        v.literal("announcement"),
        v.literal("intro"),
        v.literal("outro")
      )
    ),
    customTitle: v.optional(v.string()),
    customDurationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const removeItem = mutation({
  args: { id: v.id("setlistItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;

    await ctx.db.delete(args.id);

    // Reorder remaining items
    const items = await ctx.db
      .query("setlistItems")
      .withIndex("by_setlistId", (q) => q.eq("setlistId", item.setlistId))
      .collect();

    const sortedItems = items.sort((a, b) => a.position - b.position);
    await Promise.all(
      sortedItems.map((item, index) =>
        ctx.db.patch(item._id, { position: index })
      )
    );
  },
});

export const updateItems = mutation({
  args: {
    setlistId: v.id("setlists"),
    items: v.array(
      v.object({
        songId: v.optional(v.id("songs")),
        itemType: v.union(
          v.literal("song"),
          v.literal("pause"),
          v.literal("announcement"),
          v.literal("intro"),
          v.literal("outro")
        ),
        customTitle: v.optional(v.string()),
        customDurationMinutes: v.optional(v.number()),
        notes: v.optional(v.string()),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing items
    const existing = await ctx.db
      .query("setlistItems")
      .withIndex("by_setlistId", (q) => q.eq("setlistId", args.setlistId))
      .collect();

    await Promise.all(existing.map((item) => ctx.db.delete(item._id)));

    // Insert new items
    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("setlistItems", {
          setlistId: args.setlistId,
          ...item,
        })
      )
    );
  },
});

export const reorderItems = mutation({
  args: {
    setlistId: v.id("setlists"),
    itemIds: v.array(v.id("setlistItems")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.itemIds.map((id, index) => ctx.db.patch(id, { position: index }))
    );
  },
});
