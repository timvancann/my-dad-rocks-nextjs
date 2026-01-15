import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ============================================
// Migration Helper Mutations (Idempotent/Upsert)
// These are used by the migration script to import data from Supabase
// All mutations check for existing records and return existing ID if found
// ============================================

export const upsertBandMember = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if band member exists by email
    const existing = await ctx.db
      .query("bandMembers")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("bandMembers", args);
  },
});

export const upsertSong = mutation({
  args: {
    title: v.string(),
    artist: v.optional(v.string()),
    slug: v.string(),
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
    dualGuitar: v.boolean(),
    dualVocal: v.boolean(),
    canPlayWithoutSinger: v.boolean(),
    // Embedded stats
    timesPlayed: v.optional(v.number()),
    timesPracticed: v.optional(v.number()),
    masteryLevel: v.optional(v.number()),
    lastPracticedAt: v.optional(v.number()),
    firstLearnedAt: v.optional(v.number()),
    lastPlayedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if song exists by slug
    const existing = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();

    if (existing) {
      // Update existing record (preserve storage IDs)
      const { ...updates } = args;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert("songs", args);
  },
});

export const upsertSongLink = mutation({
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
    // Check if link exists by songId + url
    const existing = await ctx.db
      .query("songLinks")
      .filter((q) =>
        q.and(
          q.eq(q.field("songId"), args.songId),
          q.eq(q.field("url"), args.url)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("songLinks", args);
  },
});

export const upsertSongSection = mutation({
  args: {
    songId: v.id("songs"),
    name: v.string(),
    startTime: v.number(),
    color: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if section exists by songId + name + startTime
    const existing = await ctx.db
      .query("songSections")
      .filter((q) =>
        q.and(
          q.eq(q.field("songId"), args.songId),
          q.eq(q.field("name"), args.name),
          q.eq(q.field("startTime"), args.startTime)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("songSections", args);
  },
});

export const upsertSongAudioCue = mutation({
  args: {
    songId: v.id("songs"),
    title: v.string(),
    cueUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if audio cue exists by songId + title
    const existing = await ctx.db
      .query("songAudioCues")
      .filter((q) =>
        q.and(
          q.eq(q.field("songId"), args.songId),
          q.eq(q.field("title"), args.title)
        )
      )
      .first();

    if (existing) {
      // Preserve existing cueStorageId if it exists
      const { ...updates } = args;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert("songAudioCues", args);
  },
});

export const upsertSetlist = mutation({
  args: {
    title: v.string(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    totalDurationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if setlist exists by title
    const existing = await ctx.db
      .query("setlists")
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("setlists", args);
  },
});

export const upsertSetlistItem = mutation({
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
    position: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if item exists by setlistId + position
    const existing = await ctx.db
      .query("setlistItems")
      .filter((q) =>
        q.and(
          q.eq(q.field("setlistId"), args.setlistId),
          q.eq(q.field("position"), args.position)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("setlistItems", args);
  },
});

export const upsertGig = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    paymentAmount: v.optional(v.number()),
    paymentStatus: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))
    ),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    setlistId: v.optional(v.id("setlists")),
    videoPlaylistUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if gig exists by title + date
    const existing = await ctx.db
      .query("gigs")
      .filter((q) =>
        q.and(
          q.eq(q.field("title"), args.title),
          q.eq(q.field("date"), args.date)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("gigs", args);
  },
});

export const upsertPracticeSession = mutation({
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
    // Check if session exists by title + date
    const existing = await ctx.db
      .query("practiceSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("title"), args.title),
          q.eq(q.field("date"), args.date)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("practiceSessions", args);
  },
});

export const upsertPracticeSessionSong = mutation({
  args: {
    sessionId: v.id("practiceSessions"),
    songId: v.id("songs"),
    qualityRating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if exists by sessionId + songId
    const existing = await ctx.db
      .query("practiceSessionSongs")
      .filter((q) =>
        q.and(
          q.eq(q.field("sessionId"), args.sessionId),
          q.eq(q.field("songId"), args.songId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("practiceSessionSongs", args);
  },
});

export const upsertProposal = mutation({
  args: {
    title: v.optional(v.string()),
    band: v.optional(v.string()),
    album: v.optional(v.string()),
    coverart: v.optional(v.string()),
    uri: v.optional(v.string()),
    createdBy: v.optional(v.id("bandMembers")),
  },
  handler: async (ctx, args) => {
    // Check if proposal exists by uri (Spotify URI is unique)
    if (args.uri) {
      const existing = await ctx.db
        .query("proposals")
        .filter((q) => q.eq(q.field("uri"), args.uri))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, args);
        return existing._id;
      }
    }

    return await ctx.db.insert("proposals", args);
  },
});

export const upsertProposalVote = mutation({
  args: {
    proposalId: v.id("proposals"),
    bandMemberId: v.id("bandMembers"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    // Check if vote exists by proposalId + bandMemberId
    const existing = await ctx.db
      .query("proposalVotes")
      .filter((q) =>
        q.and(
          q.eq(q.field("proposalId"), args.proposalId),
          q.eq(q.field("bandMemberId"), args.bandMemberId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("proposalVotes", args);
  },
});

export const upsertChecklistItem = mutation({
  args: {
    userEmail: v.string(),
    name: v.string(),
    isChecked: v.boolean(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if item exists by userEmail + name
    const existing = await ctx.db
      .query("checklistItems")
      .filter((q) =>
        q.and(
          q.eq(q.field("userEmail"), args.userEmail),
          q.eq(q.field("name"), args.name)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("checklistItems", args);
  },
});

// ============================================
// File Storage Migration
// ============================================

export const updateSongStorageId = mutation({
  args: {
    songId: v.id("songs"),
    audioStorageId: v.optional(v.id("_storage")),
    artworkStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { songId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(songId, filteredUpdates);
  },
});

export const updateAudioCueStorageId = mutation({
  args: {
    cueId: v.id("songAudioCues"),
    cueStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cueId, { cueStorageId: args.cueStorageId });
  },
});
