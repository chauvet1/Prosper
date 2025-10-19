import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user profile (deprecated - use workos.ts instead)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // This function is deprecated - use workos.ts functions instead
    return null;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Update user profile (deprecated - use workos.ts instead)
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      language: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    // This function is deprecated - use workos.ts functions instead
    throw new Error("This function is deprecated. Use workos.ts functions instead.");
  },
});

// Get user behavior data for recommendations (deprecated - use workos.ts instead)
export const getUserBehavior = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, { userId }) => {
    // This function is deprecated - use workos.ts functions instead
    return null;
  },
});

// Track user behavior (deprecated - use workos.ts instead)
export const trackUserBehavior = mutation({
  args: {
    action: v.object({
      type: v.string(),
      page: v.string(),
      data: v.any(),
      duration: v.optional(v.number()),
      query: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { action }) => {
    // This function is deprecated - use workos.ts functions instead
    throw new Error("This function is deprecated. Use workos.ts functions instead.");
  },
});

// Get user preferences (deprecated - use workos.ts instead)
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    // This function is deprecated - use workos.ts functions instead
    return null;
  },
});

// Update user preferences (deprecated - use workos.ts instead)
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      theme: v.optional(v.string()),
      language: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { preferences }) => {
    // This function is deprecated - use workos.ts functions instead
    throw new Error("This function is deprecated. Use workos.ts functions instead.");
  },
});
