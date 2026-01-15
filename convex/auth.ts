import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// User Operations
// ============================================

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserByAccount = query({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_provider_providerAccountId", (q) =>
        q
          .eq("provider", args.provider)
          .eq("providerAccountId", args.providerAccountId)
      )
      .unique();

    if (!account) return null;
    return await ctx.db.get(account.userId);
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    // Delete associated sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.id))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete associated accounts
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.id))
      .collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    // Delete the user
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Account Operations
// ============================================

export const linkAccount = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("accounts", args);
  },
});

export const unlinkAccount = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_provider_providerAccountId", (q) =>
        q
          .eq("provider", args.provider)
          .eq("providerAccountId", args.providerAccountId)
      )
      .unique();

    if (account) {
      await ctx.db.delete(account._id);
    }
  },
});

// ============================================
// Session Operations
// ============================================

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", args);
  },
});

export const getSessionAndUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) =>
        q.eq("sessionToken", args.sessionToken)
      )
      .unique();

    if (!session) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return { session, user };
  },
});

export const updateSession = mutation({
  args: {
    sessionToken: v.string(),
    expires: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) =>
        q.eq("sessionToken", args.sessionToken)
      )
      .unique();

    if (session && args.expires) {
      await ctx.db.patch(session._id, { expires: args.expires });
    }
  },
});

export const deleteSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) =>
        q.eq("sessionToken", args.sessionToken)
      )
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// ============================================
// Verification Token Operations
// ============================================

export const createVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("verificationTokens", args);
  },
});

export const useVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const verificationToken = await ctx.db
      .query("verificationTokens")
      .withIndex("by_identifier_token", (q) =>
        q.eq("identifier", args.identifier).eq("token", args.token)
      )
      .unique();

    if (!verificationToken) return null;

    await ctx.db.delete(verificationToken._id);
    return verificationToken;
  },
});
