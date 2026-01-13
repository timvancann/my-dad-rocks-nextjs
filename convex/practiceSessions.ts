import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("practiceSessions")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) return null;

    // Get session songs
    const sessionSongs = await ctx.db
      .query("practiceSessionSongs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.id))
      .collect();

    // Fetch song details
    const songsWithDetails = await Promise.all(
      sessionSongs.map(async (ss) => {
        const song = await ctx.db.get(ss.songId);
        if (!song) return { ...ss, song: null };

        const audioUrl = song.audioStorageId
          ? await ctx.storage.getUrl(song.audioStorageId)
          : song.audioUrl;
        const artworkUrl = song.artworkStorageId
          ? await ctx.storage.getUrl(song.artworkStorageId)
          : song.artworkUrl;

        return { ...ss, song: { ...song, audioUrl, artworkUrl } };
      })
    );

    // Get setlist if linked
    let setlist = null;
    if (session.setlistId) {
      setlist = await ctx.db.get(session.setlistId);
    }

    return {
      ...session,
      songs: songsWithDetails,
      setlist,
    };
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("practiceSessions")
      .withIndex("by_date")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    setlistId: v.optional(v.id("setlists")),
    attendees: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("practiceSessions", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("practiceSessions"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    setlistId: v.optional(v.id("setlists")),
    attendees: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
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
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    // Delete session songs first
    const sessionSongs = await ctx.db
      .query("practiceSessionSongs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.id))
      .collect();

    await Promise.all(sessionSongs.map((ss) => ctx.db.delete(ss._id)));

    // Delete session
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Practice Session Songs
// ============================================

export const addSong = mutation({
  args: {
    sessionId: v.id("practiceSessions"),
    songId: v.id("songs"),
    qualityRating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("practiceSessionSongs", args);
  },
});

export const updateSong = mutation({
  args: {
    id: v.id("practiceSessionSongs"),
    qualityRating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const removeSong = mutation({
  args: { id: v.id("practiceSessionSongs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
