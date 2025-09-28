import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// User Behavior Analysis
export const createUserBehaviorAnalysis = mutation({
  args: {
    userId: v.string(),
    analysis: v.any(),
    insights: v.array(v.string()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userBehaviorAnalyses", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getUserBehaviorAnalyses = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("userBehaviorAnalyses")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("userBehaviorAnalyses").collect();
  },
});

export const updateUserBehaviorAnalysis = mutation({
  args: {
    id: v.id("userBehaviorAnalyses"),
    analysis: v.optional(v.any()),
    insights: v.optional(v.array(v.string())),
    recommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Customer Journey
export const createCustomerJourney = mutation({
  args: {
    userId: v.string(),
    journey: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customerJourneys", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCustomerJourneys = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("customerJourneys")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("customerJourneys").collect();
  },
});

export const updateCustomerJourney = mutation({
  args: {
    id: v.id("customerJourneys"),
    journey: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Customer Segments
export const createCustomerSegment = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    criteria: v.array(v.any()),
    size: v.number(),
    characteristics: v.any(),
    value: v.any(),
    engagement: v.any(),
    opportunities: v.array(v.string()),
    risks: v.array(v.string()),
    strategies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customerSegments", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCustomerSegments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customerSegments").collect();
  },
});

export const updateCustomerSegment = mutation({
  args: {
    id: v.id("customerSegments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    criteria: v.optional(v.array(v.any())),
    size: v.optional(v.number()),
    characteristics: v.optional(v.any()),
    value: v.optional(v.any()),
    engagement: v.optional(v.any()),
    opportunities: v.optional(v.array(v.string())),
    risks: v.optional(v.array(v.string())),
    strategies: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Lifetime Value Predictions
export const createLifetimeValuePrediction = mutation({
  args: {
    userId: v.string(),
    prediction: v.any(),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lifetimeValuePredictions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getLifetimeValuePredictions = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("lifetimeValuePredictions")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("lifetimeValuePredictions").collect();
  },
});

export const updateLifetimeValuePrediction = mutation({
  args: {
    id: v.id("lifetimeValuePredictions"),
    prediction: v.optional(v.any()),
    recommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Churn Predictions
export const createChurnPrediction = mutation({
  args: {
    userId: v.string(),
    prediction: v.any(),
    interventions: v.array(v.any()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("churnPredictions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getChurnPredictions = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("churnPredictions")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("churnPredictions").collect();
  },
});

export const updateChurnPrediction = mutation({
  args: {
    id: v.id("churnPredictions"),
    prediction: v.optional(v.any()),
    interventions: v.optional(v.array(v.any())),
    recommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
