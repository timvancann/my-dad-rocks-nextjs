import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").order("asc").collect();

    // Get URLs for storage IDs and stem counts
    const songsWithUrls = await Promise.all(
      songs.map(async (song) => {
        const audioUrl = song.audioStorageId
          ? await ctx.storage.getUrl(song.audioStorageId)
          : song.audioUrl;
        const artworkUrl = song.artworkStorageId
          ? await ctx.storage.getUrl(song.artworkStorageId)
          : song.artworkUrl;

        // Count stems for this song
        const audioCues = await ctx.db
          .query("songAudioCues")
          .withIndex("by_songId", (q) => q.eq("songId", song._id))
          .collect();

        return { ...song, audioUrl, artworkUrl, stemCount: audioCues.length };
      })
    );

    return songsWithUrls;
  },
});

export const getById = query({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.id);
    if (!song) return null;

    const audioUrl = song.audioStorageId
      ? await ctx.storage.getUrl(song.audioStorageId)
      : song.audioUrl;
    const artworkUrl = song.artworkStorageId
      ? await ctx.storage.getUrl(song.artworkStorageId)
      : song.artworkUrl;

    return { ...song, audioUrl, artworkUrl };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const song = await ctx.db
      .query("songs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!song) return null;

    const audioUrl = song.audioStorageId
      ? await ctx.storage.getUrl(song.audioStorageId)
      : song.audioUrl;
    const artworkUrl = song.artworkStorageId
      ? await ctx.storage.getUrl(song.artworkStorageId)
      : song.artworkUrl;

    return { ...song, audioUrl, artworkUrl };
  },
});

export const getWithDetails = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const song = await ctx.db
      .query("songs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!song) return null;

    const [links, sections, audioCues] = await Promise.all([
      ctx.db
        .query("songLinks")
        .withIndex("by_songId", (q) => q.eq("songId", song._id))
        .collect(),
      ctx.db
        .query("songSections")
        .withIndex("by_songId", (q) => q.eq("songId", song._id))
        .collect(),
      ctx.db
        .query("songAudioCues")
        .withIndex("by_songId", (q) => q.eq("songId", song._id))
        .collect(),
    ]);

    // Get file URLs from storage IDs
    const audioUrl = song.audioStorageId
      ? await ctx.storage.getUrl(song.audioStorageId)
      : song.audioUrl;
    const artworkUrl = song.artworkStorageId
      ? await ctx.storage.getUrl(song.artworkStorageId)
      : song.artworkUrl;

    // Get URLs for audio cues
    const audioCuesWithUrls = await Promise.all(
      audioCues.map(async (cue) => {
        const cueUrl = cue.cueStorageId
          ? await ctx.storage.getUrl(cue.cueStorageId)
          : cue.cueUrl;
        return { ...cue, cueUrl };
      })
    );

    return {
      ...song,
      audioUrl,
      artworkUrl,
      links,
      sections,
      audioCues: audioCuesWithUrls,
    };
  },
});

export const getLinks = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("songLinks")
      .withIndex("by_songId", (q) => q.eq("songId", args.songId))
      .collect();
  },
});

export const getSections = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("songSections")
      .withIndex("by_songId", (q) => q.eq("songId", args.songId))
      .collect();
  },
});

export const getAudioCues = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const cues = await ctx.db
      .query("songAudioCues")
      .withIndex("by_songId", (q) => q.eq("songId", args.songId))
      .collect();

    return await Promise.all(
      cues.map(async (cue) => {
        const cueUrl = cue.cueStorageId
          ? await ctx.storage.getUrl(cue.cueStorageId)
          : cue.cueUrl;
        return { ...cue, cueUrl };
      })
    );
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
  args: {
    title: v.string(),
    artist: v.optional(v.string()),
    slug: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    artworkStorageId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    artworkUrl: v.optional(v.string()),
    lyrics: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    keySignature: v.optional(v.string()),
    tempoBpm: v.optional(v.number()),
    difficultyLevel: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    tabsChords: v.optional(v.string()),
    dualGuitar: v.optional(v.boolean()),
    dualVocal: v.optional(v.boolean()),
    canPlayWithoutSinger: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songs", {
      ...args,
      dualGuitar: args.dualGuitar ?? false,
      dualVocal: args.dualVocal ?? false,
      canPlayWithoutSinger: args.canPlayWithoutSinger ?? false,
      timesPlayed: 0,
      timesPracticed: 0,
      masteryLevel: 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("songs"),
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    lyrics: v.optional(v.string()),
    keySignature: v.optional(v.string()),
    tempoBpm: v.optional(v.number()),
    difficultyLevel: v.optional(v.number()),
    notes: v.optional(v.string()),
    tabsChords: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    dualGuitar: v.optional(v.boolean()),
    dualVocal: v.optional(v.boolean()),
    canPlayWithoutSinger: v.optional(v.boolean()),
    audioStorageId: v.optional(v.id("_storage")),
    artworkStorageId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    artworkUrl: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const updateLyrics = mutation({
  args: {
    id: v.id("songs"),
    lyrics: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lyrics: args.lyrics });
  },
});

export const markPracticed = mutation({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.id);
    if (!song) throw new Error("Song not found");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      timesPracticed: (song.timesPracticed ?? 0) + 1,
      lastPracticedAt: now,
      firstLearnedAt: song.firstLearnedAt ?? now,
    });
  },
});

export const markPlayed = mutation({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.id);
    if (!song) throw new Error("Song not found");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      timesPlayed: (song.timesPlayed ?? 0) + 1,
      lastPlayedAt: now,
    });
  },
});

export const updateMasteryLevel = mutation({
  args: {
    id: v.id("songs"),
    masteryLevel: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { masteryLevel: args.masteryLevel });
  },
});

export const remove = mutation({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    // Delete related records
    const [links, sections, cues, setlistItems, sessionSongs] =
      await Promise.all([
        ctx.db
          .query("songLinks")
          .withIndex("by_songId", (q) => q.eq("songId", args.id))
          .collect(),
        ctx.db
          .query("songSections")
          .withIndex("by_songId", (q) => q.eq("songId", args.id))
          .collect(),
        ctx.db
          .query("songAudioCues")
          .withIndex("by_songId", (q) => q.eq("songId", args.id))
          .collect(),
        ctx.db
          .query("setlistItems")
          .filter((q) => q.eq(q.field("songId"), args.id))
          .collect(),
        ctx.db
          .query("practiceSessionSongs")
          .withIndex("by_songId", (q) => q.eq("songId", args.id))
          .collect(),
      ]);

    // Get song to delete storage files
    const song = await ctx.db.get(args.id);

    // Delete all related records
    await Promise.all([
      ...links.map((l) => ctx.db.delete(l._id)),
      ...sections.map((s) => ctx.db.delete(s._id)),
      ...cues.map((c) => ctx.db.delete(c._id)),
      ...setlistItems.map((i) => ctx.db.delete(i._id)),
      ...sessionSongs.map((s) => ctx.db.delete(s._id)),
    ]);

    // Delete storage files if they exist
    if (song?.audioStorageId) {
      await ctx.storage.delete(song.audioStorageId);
    }
    if (song?.artworkStorageId) {
      await ctx.storage.delete(song.artworkStorageId);
    }

    // Delete audio cue files
    for (const cue of cues) {
      if (cue.cueStorageId) {
        await ctx.storage.delete(cue.cueStorageId);
      }
    }

    // Delete song
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Song Links
// ============================================

export const createLink = mutation({
  args: {
    songId: v.id("songs"),
    linkType: v.union(
      v.literal("youtube"),
      v.literal("youtube_music"),
      v.literal("spotify"),
      v.literal("other")
    ),
    url: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songLinks", args);
  },
});

export const updateLink = mutation({
  args: {
    id: v.id("songLinks"),
    linkType: v.optional(
      v.union(
        v.literal("youtube"),
        v.literal("youtube_music"),
        v.literal("spotify"),
        v.literal("other")
      )
    ),
    url: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const deleteLink = mutation({
  args: { id: v.id("songLinks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Song Sections
// ============================================

export const createSection = mutation({
  args: {
    songId: v.id("songs"),
    name: v.string(),
    startTime: v.number(),
    color: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songSections", args);
  },
});

export const updateSection = mutation({
  args: {
    id: v.id("songSections"),
    name: v.optional(v.string()),
    startTime: v.optional(v.number()),
    color: v.optional(v.string()),
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

export const deleteSection = mutation({
  args: { id: v.id("songSections") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Song Audio Cues (Stems)
// ============================================

export const createAudioCue = mutation({
  args: {
    songId: v.id("songs"),
    title: v.string(),
    cueStorageId: v.optional(v.id("_storage")),
    cueUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("songAudioCues", args);
  },
});

export const updateAudioCue = mutation({
  args: {
    id: v.id("songAudioCues"),
    title: v.optional(v.string()),
    cueStorageId: v.optional(v.id("_storage")),
    cueUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const deleteAudioCue = mutation({
  args: { id: v.id("songAudioCues") },
  handler: async (ctx, args) => {
    const cue = await ctx.db.get(args.id);
    if (cue?.cueStorageId) {
      await ctx.storage.delete(cue.cueStorageId);
    }
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Storage Functions
// ============================================

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteStorageFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

// Delete multiple storage files at once
export const deleteStorageFiles = mutation({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const results: { id: string; success: boolean; error?: string }[] = [];
    for (const storageId of args.storageIds) {
      try {
        await ctx.storage.delete(storageId);
        results.push({ id: storageId, success: true });
      } catch (e) {
        results.push({
          id: storageId,
          success: false,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }
    return results;
  },
});

export const listAllAudioCues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songAudioCues").collect();
  },
});

// List all storage files in Convex
export const listAllStorageFiles = query({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db.system.query("_storage").collect();
    return files.map((f) => ({
      id: f._id,
      size: f.size,
      contentType: f.contentType,
    }));
  },
});

// Get all storage IDs referenced in the database (songs + audio cues)
export const getReferencedStorageIds = query({
  args: {},
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").collect();
    const audioCues = await ctx.db.query("songAudioCues").collect();

    const referencedIds: string[] = [];

    for (const song of songs) {
      if (song.audioStorageId) {
        referencedIds.push(song.audioStorageId);
      }
      if (song.artworkStorageId) {
        referencedIds.push(song.artworkStorageId);
      }
    }

    for (const cue of audioCues) {
      if (cue.cueStorageId) {
        referencedIds.push(cue.cueStorageId);
      }
    }

    return {
      total: referencedIds.length,
      songAudioCount: songs.filter((s) => s.audioStorageId).length,
      songArtworkCount: songs.filter((s) => s.artworkStorageId).length,
      audioCueCount: audioCues.filter((c) => c.cueStorageId).length,
      storageIds: referencedIds,
    };
  },
});
