import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Pricing Optimization
export const createPricingOptimization = mutation({
  args: {
    product: v.string(),
    currentPrice: v.number(),
    optimizedPrice: v.number(),
    confidence: v.number(),
    factors: v.array(v.any()),
    elasticity: v.any(),
    scenarios: v.array(v.any()),
    competitive: v.any(),
    customer: v.any(),
    recommendations: v.array(v.string()),
    risks: v.array(v.string()),
    implementation: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pricingOptimizations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getPricingOptimizations = query({
  args: { product: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.product) {
      return await ctx.db
        .query("pricingOptimizations")
        .filter((q) => q.eq(q.field("product"), args.product))
        .collect();
    }
    return await ctx.db.query("pricingOptimizations").collect();
  },
});

export const updatePricingOptimization = mutation({
  args: {
    id: v.id("pricingOptimizations"),
    product: v.optional(v.string()),
    currentPrice: v.optional(v.number()),
    optimizedPrice: v.optional(v.number()),
    confidence: v.optional(v.number()),
    factors: v.optional(v.array(v.any())),
    elasticity: v.optional(v.any()),
    scenarios: v.optional(v.array(v.any())),
    competitive: v.optional(v.any()),
    customer: v.optional(v.any()),
    recommendations: v.optional(v.array(v.string())),
    risks: v.optional(v.array(v.string())),
    implementation: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Conversion Optimization
export const createConversionOptimization = mutation({
  args: {
    funnel: v.string(),
    currentRate: v.number(),
    optimizedRate: v.number(),
    improvement: v.number(),
    factors: v.array(v.any()),
    stages: v.array(v.any()),
    experiments: v.array(v.any()),
    personalization: v.any(),
    technical: v.any(),
    content: v.any(),
    recommendations: v.array(v.string()),
    risks: v.array(v.string()),
    implementation: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversionOptimizations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getConversionOptimizations = query({
  args: { funnel: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.funnel) {
      return await ctx.db
        .query("conversionOptimizations")
        .filter((q) => q.eq(q.field("funnel"), args.funnel))
        .collect();
    }
    return await ctx.db.query("conversionOptimizations").collect();
  },
});

export const updateConversionOptimization = mutation({
  args: {
    id: v.id("conversionOptimizations"),
    funnel: v.optional(v.string()),
    currentRate: v.optional(v.number()),
    optimizedRate: v.optional(v.number()),
    improvement: v.optional(v.number()),
    factors: v.optional(v.array(v.any())),
    stages: v.optional(v.array(v.any())),
    experiments: v.optional(v.array(v.any())),
    personalization: v.optional(v.any()),
    technical: v.optional(v.any()),
    content: v.optional(v.any()),
    recommendations: v.optional(v.array(v.string())),
    risks: v.optional(v.array(v.string())),
    implementation: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Revenue Forecasts
export const createRevenueForecast = mutation({
  args: {
    period: v.any(),
    forecast: v.any(),
    breakdown: v.any(),
    drivers: v.array(v.any()),
    scenarios: v.array(v.any()),
    risks: v.array(v.any()),
    opportunities: v.array(v.any()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("revenueForecasts", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getRevenueForecasts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("revenueForecasts").collect();
  },
});

export const updateRevenueForecast = mutation({
  args: {
    id: v.id("revenueForecasts"),
    period: v.optional(v.any()),
    forecast: v.optional(v.any()),
    breakdown: v.optional(v.any()),
    drivers: v.optional(v.array(v.any())),
    scenarios: v.optional(v.array(v.any())),
    risks: v.optional(v.array(v.any())),
    opportunities: v.optional(v.array(v.any())),
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

// Profit Margin Analysis
export const createProfitMarginAnalysis = mutation({
  args: {
    period: v.any(),
    analysis: v.any(),
    breakdown: v.any(),
    costs: v.any(),
    optimization: v.any(),
    benchmarks: v.any(),
    recommendations: v.array(v.string()),
    risks: v.array(v.string()),
    implementation: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profitMarginAnalyses", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getProfitMarginAnalyses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profitMarginAnalyses").collect();
  },
});

export const updateProfitMarginAnalysis = mutation({
  args: {
    id: v.id("profitMarginAnalyses"),
    period: v.optional(v.any()),
    analysis: v.optional(v.any()),
    breakdown: v.optional(v.any()),
    costs: v.optional(v.any()),
    optimization: v.optional(v.any()),
    benchmarks: v.optional(v.any()),
    recommendations: v.optional(v.array(v.string())),
    risks: v.optional(v.array(v.string())),
    implementation: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
