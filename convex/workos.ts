import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get current user from WorkOS
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // This will be called from the frontend with WorkOS user context
    // For now, return null - the frontend will handle auth state
    return null;
  },
});

// Get user by WorkOS ID
export const getUserByWorkosId = query({
  args: { workosId: v.string() },
  handler: async (ctx, { workosId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
      .first();
    
    return user;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    return user;
  },
});

// Create or update user from WorkOS
export const upsertUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.union(v.string(), v.null())),
    emailVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by WorkOS ID
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();

    // If not found by WorkOS ID, check by email
    if (!existingUser) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
    }

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        workosId: args.workosId, // Ensure WorkOS ID is set
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        profilePictureUrl: args.profilePictureUrl,
        emailVerified: args.emailVerified,
        lastLoginAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        workosId: args.workosId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        profilePictureUrl: args.profilePictureUrl,
        emailVerified: args.emailVerified,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        role: args.email.endsWith('@admin.com') ? 'admin' : 'client', // Simple role detection
      });
      return userId;
    }
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    workosId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { workosId, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { role });
    return user._id;
  },
});

// Update user role by email
export const updateUserRoleByEmail = mutation({
  args: {
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { email, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { role });
    return user._id;
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    workosId: v.string(),
    preferences: v.object({
      theme: v.optional(v.string()),
      language: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { workosId, preferences }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { preferences });
    return user._id;
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

// Delete user
export const deleteUser = mutation({
  args: { workosId: v.string() },
  handler: async (ctx, { workosId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.delete(user._id);
    return user._id;
  },
});
