import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================
// Query Functions
// ============================================

export const getByUserEmail = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("checklistItems")
      .withIndex("by_userEmail_position", (q) =>
        q.eq("userEmail", args.userEmail)
      )
      .collect();
  },
});

// ============================================
// Mutation Functions
// ============================================

export const create = mutation({
  args: {
    userEmail: v.string(),
    name: v.string(),
    isChecked: v.optional(v.boolean()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get position if not provided
    let position = args.position;
    if (position === undefined) {
      const items = await ctx.db
        .query("checklistItems")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", args.userEmail))
        .collect();
      position = items.length;
    }

    return await ctx.db.insert("checklistItems", {
      ...args,
      isChecked: args.isChecked ?? false,
      position,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("checklistItems"),
    name: v.optional(v.string()),
    isChecked: v.optional(v.boolean()),
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

export const toggle = mutation({
  args: { id: v.id("checklistItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Checklist item not found");
    await ctx.db.patch(args.id, { isChecked: !item.isChecked });
  },
});

export const remove = mutation({
  args: { id: v.id("checklistItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;

    await ctx.db.delete(args.id);

    // Reorder remaining items
    const items = await ctx.db
      .query("checklistItems")
      .withIndex("by_userEmail", (q) => q.eq("userEmail", item.userEmail))
      .collect();

    const sortedItems = items.sort((a, b) => a.position - b.position);
    await Promise.all(
      sortedItems.map((item, index) =>
        ctx.db.patch(item._id, { position: index })
      )
    );
  },
});

export const reorder = mutation({
  args: {
    userEmail: v.string(),
    itemIds: v.array(v.id("checklistItems")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.itemIds.map((id, index) => ctx.db.patch(id, { position: index }))
    );
  },
});

export const clearCompleted = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("checklistItems")
      .withIndex("by_userEmail", (q) => q.eq("userEmail", args.userEmail))
      .filter((q) => q.eq(q.field("isChecked"), true))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    // Reorder remaining items
    const remainingItems = await ctx.db
      .query("checklistItems")
      .withIndex("by_userEmail", (q) => q.eq("userEmail", args.userEmail))
      .collect();

    const sortedItems = remainingItems.sort((a, b) => a.position - b.position);
    await Promise.all(
      sortedItems.map((item, index) =>
        ctx.db.patch(item._id, { position: index })
      )
    );
  },
});
