import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const proposals = await ctx.db.query("proposals").order("desc").collect();

    // Fetch votes and creator for each proposal
    const proposalsWithDetails = await Promise.all(
      proposals.map(async (proposal) => {
        const votes = await ctx.db
          .query("proposalVotes")
          .withIndex("by_proposalId", (q) => q.eq("proposalId", proposal._id))
          .collect();

        // Fetch band member details for each vote
        const votesWithMembers = await Promise.all(
          votes.map(async (vote) => {
            const member = await ctx.db.get(vote.bandMemberId);
            return { ...vote, bandMember: member };
          })
        );

        // Fetch creator
        let creator = null;
        if (proposal.createdBy) {
          creator = await ctx.db.get(proposal.createdBy);
        }

        return {
          ...proposal,
          votes: votesWithMembers,
          creator,
        };
      })
    );

    return proposalsWithDetails;
  },
});

export const getById = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.id);
    if (!proposal) return null;

    const votes = await ctx.db
      .query("proposalVotes")
      .withIndex("by_proposalId", (q) => q.eq("proposalId", args.id))
      .collect();

    const votesWithMembers = await Promise.all(
      votes.map(async (vote) => {
        const member = await ctx.db.get(vote.bandMemberId);
        return { ...vote, bandMember: member };
      })
    );

    let creator = null;
    if (proposal.createdBy) {
      creator = await ctx.db.get(proposal.createdBy);
    }

    return {
      ...proposal,
      votes: votesWithMembers,
      creator,
    };
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    band: v.optional(v.string()),
    album: v.optional(v.string()),
    coverart: v.optional(v.string()),
    uri: v.optional(v.string()),
    createdBy: v.optional(v.id("bandMembers")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("proposals", args);
  },
});

export const createWithVote = mutation({
  args: {
    title: v.optional(v.string()),
    band: v.optional(v.string()),
    album: v.optional(v.string()),
    coverart: v.optional(v.string()),
    uri: v.optional(v.string()),
    createdBy: v.id("bandMembers"),
    initialVote: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const { initialVote, ...proposalData } = args;

    // Create the proposal
    const proposalId = await ctx.db.insert("proposals", proposalData);

    // Create the initial vote from the creator
    await ctx.db.insert("proposalVotes", {
      proposalId,
      bandMemberId: args.createdBy,
      status: initialVote,
    });

    return proposalId;
  },
});

export const remove = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    // Delete all votes first
    const votes = await ctx.db
      .query("proposalVotes")
      .withIndex("by_proposalId", (q) => q.eq("proposalId", args.id))
      .collect();

    await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));

    // Delete proposal
    await ctx.db.delete(args.id);
  },
});

// ============================================
// Voting
// ============================================

export const vote = mutation({
  args: {
    proposalId: v.id("proposals"),
    bandMemberId: v.id("bandMembers"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    // Check if vote already exists
    const existingVote = await ctx.db
      .query("proposalVotes")
      .withIndex("by_proposal_member", (q) =>
        q.eq("proposalId", args.proposalId).eq("bandMemberId", args.bandMemberId)
      )
      .unique();

    if (existingVote) {
      // Update existing vote
      await ctx.db.patch(existingVote._id, { status: args.status });
      return existingVote._id;
    } else {
      // Create new vote
      return await ctx.db.insert("proposalVotes", args);
    }
  },
});

export const removeVote = mutation({
  args: {
    proposalId: v.id("proposals"),
    bandMemberId: v.id("bandMembers"),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("proposalVotes")
      .withIndex("by_proposal_member", (q) =>
        q.eq("proposalId", args.proposalId).eq("bandMemberId", args.bandMemberId)
      )
      .unique();

    if (vote) {
      await ctx.db.delete(vote._id);
    }
  },
});
