import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gigs")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.id);
    if (!gig) return null;

    let setlist = null;
    if (gig.setlistId) {
      const setlistDoc = await ctx.db.get(gig.setlistId);
      if (setlistDoc) {
        const items = await ctx.db
          .query("setlistItems")
          .withIndex("by_setlistId", (q) => q.eq("setlistId", gig.setlistId!))
          .collect();

        // Sort by position
        items.sort((a, b) => a.position - b.position);

        // Fetch songs
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

        setlist = { ...setlistDoc, items: itemsWithSongs };
      }
    }

    return { ...gig, setlist };
  },
});

export const getUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const gigs = await ctx.db
      .query("gigs")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("date"), today))
      .order("asc")
      .take(args.limit ?? 5);
    return gigs;
  },
});

export const getPast = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const gigs = await ctx.db
      .query("gigs")
      .withIndex("by_date")
      .filter((q) => q.lt(q.field("date"), today))
      .order("desc")
      .take(args.limit ?? 10);
    return gigs;
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
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
    videoPlaylistUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gigs", {
      ...args,
      status: args.status ?? "scheduled",
      paymentStatus: args.paymentStatus ?? "pending",
    });
  },
});

export const createWithSetlist = mutation({
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a setlist for the gig
    const setlistId = await ctx.db.insert("setlists", {
      title: `Setlist - ${args.title}`,
      type: "gig",
    });

    // Create the gig with the setlist
    return await ctx.db.insert("gigs", {
      ...args,
      setlistId,
      status: "scheduled",
      paymentStatus: "pending",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("gigs"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
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
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.id);
    if (!gig) return;

    // Optionally delete the associated setlist
    if (gig.setlistId) {
      const items = await ctx.db
        .query("setlistItems")
        .withIndex("by_setlistId", (q) => q.eq("setlistId", gig.setlistId!))
        .collect();
      await Promise.all(items.map((item) => ctx.db.delete(item._id)));
      await ctx.db.delete(gig.setlistId);
    }

    await ctx.db.delete(args.id);
  },
});
