import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bandMembers").order("asc").collect();
  },
});

export const getById = query({
  args: { id: v.id("bandMembers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bandMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if member already exists
    const existing = await ctx.db
      .query("bandMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Update existing member
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        role: args.role ?? existing.role,
        avatarUrl: args.avatarUrl ?? existing.avatarUrl,
        userId: args.userId ?? existing.userId,
      });
      return existing._id;
    }

    return await ctx.db.insert("bandMembers", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("bandMembers"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const ensureByEmail = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if member already exists
    const existing = await ctx.db
      .query("bandMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Update existing member with new info
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        avatarUrl: args.avatarUrl ?? existing.avatarUrl,
      });
      return existing._id;
    }

    // Create new member
    return await ctx.db.insert("bandMembers", {
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: "member",
    });
  },
});

export const linkToUser = mutation({
  args: {
    bandMemberId: v.id("bandMembers"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bandMemberId, { userId: args.userId });
  },
});

export const remove = mutation({
  args: { id: v.id("bandMembers") },
  handler: async (ctx, args) => {
    // Delete all votes by this member
    const votes = await ctx.db
      .query("proposalVotes")
      .withIndex("by_bandMemberId", (q) => q.eq("bandMemberId", args.id))
      .collect();

    await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));

    // Delete member
    await ctx.db.delete(args.id);
  },
});
