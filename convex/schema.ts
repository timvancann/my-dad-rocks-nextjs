import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // NextAuth Adapter Tables (required for auth)
  // ============================================
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
  })
    .index("by_sessionToken", ["sessionToken"])
    .index("by_userId", ["userId"]),

  accounts: defineTable({
    userId: v.id("users"),
    type: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_provider_providerAccountId", ["provider", "providerAccountId"]),

  verificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  }).index("by_identifier_token", ["identifier", "token"]),

  // ============================================
  // Band Members (authorization layer)
  // ============================================
  bandMembers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  })
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  // ============================================
  // Songs (with embedded stats from song_stats)
  // ============================================
  songs: defineTable({
    title: v.string(),
    artist: v.optional(v.string()),
    slug: v.string(),

    // File references (Convex storage IDs)
    audioStorageId: v.optional(v.id("_storage")),
    artworkStorageId: v.optional(v.id("_storage")),
    // Keep URLs for backward compatibility during migration
    audioUrl: v.optional(v.string()),
    artworkUrl: v.optional(v.string()),

    // Song metadata
    lyrics: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    keySignature: v.optional(v.string()),
    tempoBpm: v.optional(v.number()),
    difficultyLevel: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    tabsChords: v.optional(v.string()),

    // Performance flags
    dualGuitar: v.boolean(),
    dualVocal: v.boolean(),
    canPlayWithoutSinger: v.boolean(),

    // Embedded stats (merged from song_stats table)
    timesPlayed: v.optional(v.number()),
    timesPracticed: v.optional(v.number()),
    masteryLevel: v.optional(v.number()),
    lastPracticedAt: v.optional(v.number()),
    firstLearnedAt: v.optional(v.number()),
    lastPlayedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_title", ["title"])
    .index("by_artist", ["artist"])
    .index("by_masteryLevel", ["masteryLevel"]),

  // ============================================
  // Song Links (external references)
  // ============================================
  songLinks: defineTable({
    songId: v.id("songs"),
    linkType: v.union(
      v.literal("youtube"),
      v.literal("youtube_music"),
      v.literal("spotify"),
      v.literal("other")
    ),
    url: v.string(),
    title: v.optional(v.string()),
  }).index("by_songId", ["songId"]),

  // ============================================
  // Song Sections (timeline markers)
  // ============================================
  songSections: defineTable({
    songId: v.id("songs"),
    name: v.string(),
    startTime: v.number(),
    color: v.optional(v.string()),
    position: v.optional(v.number()),
  })
    .index("by_songId", ["songId"])
    .index("by_songId_startTime", ["songId", "startTime"]),

  // ============================================
  // Song Audio Cues (stem tracks)
  // ============================================
  songAudioCues: defineTable({
    songId: v.id("songs"),
    title: v.string(),
    cueStorageId: v.optional(v.id("_storage")),
    cueUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  })
    .index("by_songId", ["songId"])
    .index("by_songId_sortOrder", ["songId", "sortOrder"]),

  // ============================================
  // Setlists
  // ============================================
  setlists: defineTable({
    title: v.string(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    totalDurationMinutes: v.optional(v.number()),
  }).index("by_title", ["title"]),

  // ============================================
  // Setlist Items (join table)
  // ============================================
  setlistItems: defineTable({
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
  })
    .index("by_setlistId", ["setlistId"])
    .index("by_setlistId_position", ["setlistId", "position"]),

  // ============================================
  // Gigs
  // ============================================
  gigs: defineTable({
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
  })
    .index("by_date", ["date"])
    .index("by_setlistId", ["setlistId"]),

  // ============================================
  // Practice Sessions
  // ============================================
  practiceSessions: defineTable({
    title: v.string(),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    setlistId: v.optional(v.id("setlists")),
    attendees: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_setlistId", ["setlistId"]),

  // ============================================
  // Practice Session Songs
  // ============================================
  practiceSessionSongs: defineTable({
    sessionId: v.id("practiceSessions"),
    songId: v.id("songs"),
    qualityRating: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_songId", ["songId"]),

  // ============================================
  // Proposals (song suggestions)
  // ============================================
  proposals: defineTable({
    title: v.optional(v.string()),
    band: v.optional(v.string()),
    album: v.optional(v.string()),
    coverart: v.optional(v.string()),
    uri: v.optional(v.string()),
    createdBy: v.optional(v.id("bandMembers")),
  }).index("by_createdBy", ["createdBy"]),

  // ============================================
  // Proposal Votes
  // ============================================
  proposalVotes: defineTable({
    proposalId: v.id("proposals"),
    bandMemberId: v.id("bandMembers"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  })
    .index("by_proposalId", ["proposalId"])
    .index("by_bandMemberId", ["bandMemberId"])
    .index("by_proposal_member", ["proposalId", "bandMemberId"]),

  // ============================================
  // Checklist Items (personal)
  // ============================================
  checklistItems: defineTable({
    userEmail: v.string(),
    name: v.string(),
    isChecked: v.boolean(),
    position: v.number(),
  })
    .index("by_userEmail", ["userEmail"])
    .index("by_userEmail_position", ["userEmail", "position"]),
});
