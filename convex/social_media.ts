import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Social Media Accounts
export const createSocialMediaAccount = mutation({
  args: {
    platform: v.string(),
    username: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("socialMediaAccounts", {
      ...args,
      lastSync: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getSocialMediaAccounts = query({
  args: { 
    platform: v.optional(v.string()),
    isActive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("socialMediaAccounts");
    
    if (args.platform) {
      query = query.filter((q) => q.eq(q.field("platform"), args.platform));
    }
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }
    
    return await query.collect();
  },
});

export const updateSocialMediaAccount = mutation({
  args: {
    id: v.id("socialMediaAccounts"),
    platform: v.optional(v.string()),
    username: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    lastSync: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Social Media Posts
export const createSocialMediaPost = mutation({
  args: {
    accountId: v.string(),
    content: v.string(),
    media: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("socialMediaPosts", {
      ...args,
      publishedAt: undefined,
      status: "draft",
      engagement: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getSocialMediaPosts = query({
  args: { 
    accountId: v.optional(v.string()),
    status: v.optional(v.string()),
    platform: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("socialMediaPosts");
    
    if (args.accountId) {
      query = query.filter((q) => q.eq(q.field("accountId"), args.accountId));
    }
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.platform) {
      query = query.filter((q) => q.eq(q.field("platform"), args.platform));
    }
    
    return await query.collect();
  },
});

export const updateSocialMediaPost = mutation({
  args: {
    id: v.id("socialMediaPosts"),
    accountId: v.optional(v.string()),
    content: v.optional(v.string()),
    media: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    status: v.optional(v.string()),
    platform: v.optional(v.string()),
    engagement: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Social Media Campaigns
export const createSocialMediaCampaign = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    platforms: v.array(v.string()),
    posts: v.array(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("socialMediaCampaigns", {
      ...args,
      metrics: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getSocialMediaCampaigns = query({
  args: { 
    status: v.optional(v.string()),
    platforms: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("socialMediaCampaigns");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.platforms && args.platforms.length > 0) {
      query = query.filter((q) => 
        q.or(...args.platforms!.map(platform => q.eq(q.field("platforms"), platform)))
      );
    }
    
    return await query.collect();
  },
});

export const updateSocialMediaCampaign = mutation({
  args: {
    id: v.id("socialMediaCampaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    posts: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),
    status: v.optional(v.string()),
    metrics: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Social Media Analytics
export const createSocialMediaAnalytics = mutation({
  args: {
    accountId: v.string(),
    period: v.any(),
    metrics: v.any(),
    engagement: v.any(),
    reach: v.any(),
    impressions: v.any(),
    clicks: v.any(),
    shares: v.any(),
    comments: v.any(),
    likes: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("socialMediaAnalytics", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getSocialMediaAnalytics = query({
  args: { accountId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.accountId) {
      return await ctx.db
        .query("socialMediaAnalytics")
        .filter((q) => q.eq(q.field("accountId"), args.accountId))
        .collect();
    }
    return await ctx.db.query("socialMediaAnalytics").collect();
  },
});
