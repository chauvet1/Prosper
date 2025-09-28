import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Industry Trends
export const createIndustryTrend = mutation({
  args: {
    industry: v.string(),
    trend: v.string(),
    description: v.string(),
    impact: v.string(),
    timeframe: v.string(),
    confidence: v.number(),
    sources: v.array(v.string()),
    metrics: v.any(),
    implications: v.array(v.string()),
    opportunities: v.array(v.string()),
    threats: v.array(v.string()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("industryTrends", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getIndustryTrends = query({
  args: { industry: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.industry) {
      return await ctx.db
        .query("industryTrends")
        .filter((q) => q.eq(q.field("industry"), args.industry))
        .collect();
    }
    return await ctx.db.query("industryTrends").collect();
  },
});

export const updateIndustryTrend = mutation({
  args: {
    id: v.id("industryTrends"),
    trend: v.optional(v.string()),
    description: v.optional(v.string()),
    impact: v.optional(v.string()),
    timeframe: v.optional(v.string()),
    confidence: v.optional(v.number()),
    sources: v.optional(v.array(v.string())),
    metrics: v.optional(v.any()),
    implications: v.optional(v.array(v.string())),
    opportunities: v.optional(v.array(v.string())),
    threats: v.optional(v.array(v.string())),
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

// Competitive Analysis
export const createCompetitiveAnalysis = mutation({
  args: {
    company: v.string(),
    industry: v.string(),
    analysis: v.any(),
    financials: v.any(),
    products: v.array(v.any()),
    marketing: v.any(),
    technology: v.any(),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("competitiveAnalyses", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCompetitiveAnalyses = query({
  args: { 
    company: v.optional(v.string()),
    industry: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("competitiveAnalyses");
    
    if (args.company) {
      query = query.filter((q) => q.eq(q.field("company"), args.company));
    }
    if (args.industry) {
      query = query.filter((q) => q.eq(q.field("industry"), args.industry));
    }
    
    return await query.collect();
  },
});

export const updateCompetitiveAnalysis = mutation({
  args: {
    id: v.id("competitiveAnalyses"),
    analysis: v.optional(v.any()),
    financials: v.optional(v.any()),
    products: v.optional(v.array(v.any())),
    marketing: v.optional(v.any()),
    technology: v.optional(v.any()),
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

// Market Opportunities
export const createMarketOpportunity = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    market: v.string(),
    segment: v.string(),
    size: v.any(),
    growth: v.any(),
    competition: v.any(),
    customer: v.any(),
    business: v.any(),
    risks: v.any(),
    recommendations: v.any(),
    score: v.number(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketOpportunities", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getMarketOpportunities = query({
  args: { 
    market: v.optional(v.string()),
    priority: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("marketOpportunities");
    
    if (args.market) {
      query = query.filter((q) => q.eq(q.field("market"), args.market));
    }
    if (args.priority) {
      query = query.filter((q) => q.eq(q.field("priority"), args.priority));
    }
    
    return await query.collect();
  },
});

export const updateMarketOpportunity = mutation({
  args: {
    id: v.id("marketOpportunities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    market: v.optional(v.string()),
    segment: v.optional(v.string()),
    size: v.optional(v.any()),
    growth: v.optional(v.any()),
    competition: v.optional(v.any()),
    customer: v.optional(v.any()),
    business: v.optional(v.any()),
    risks: v.optional(v.any()),
    recommendations: v.optional(v.any()),
    score: v.optional(v.number()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
