import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// AI Model Management
export const getAIModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aiModels").collect();
  },
});

export const getAIModel = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiModels")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
  },
});

export const updateAIModel = mutation({
  args: {
    id: v.string(),
    quotaUsed: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("quota_exhausted"),
      v.literal("error"),
      v.literal("maintenance")
    ),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query("aiModels")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    
    if (!model) {
      throw new Error("AI model not found");
    }

    await ctx.db.patch(model._id, {
      quotaUsed: args.quotaUsed,
      status: args.status,
      lastError: args.lastError,
      lastQuotaCheck: Date.now(),
    });
  },
});

// Content Quality Assessment
export const createContentQualityAssessment = mutation({
  args: {
    contentId: v.string(),
    contentType: v.string(),
    qualityScore: v.number(),
    grammarScore: v.number(),
    readabilityScore: v.number(),
    seoScore: v.number(),
    technicalAccuracyScore: v.number(),
    brandVoiceScore: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("needs_review")
    ),
    issues: v.array(v.string()),
    recommendations: v.array(v.string()),
    assessedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentQualityAssessments", {
      ...args,
      assessedAt: Date.now(),
    });
  },
});

export const getContentQualityAssessments = query({
  args: { contentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.contentId) {
      return await ctx.db
        .query("contentQualityAssessments")
        .filter((q) => q.eq(q.field("contentId"), args.contentId))
        .collect();
    }
    return await ctx.db.query("contentQualityAssessments").collect();
  },
});

// Content Moderation
export const createContentModerationResult = mutation({
  args: {
    contentId: v.string(),
    contentType: v.string(),
    isAppropriate: v.boolean(),
    toxicityScore: v.number(),
    biasScore: v.number(),
    spamScore: v.number(),
    brandSafetyScore: v.number(),
    flaggedIssues: v.array(v.string()),
    moderationActions: v.array(v.string()),
    moderatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentModerationResults", {
      ...args,
      moderatedAt: Date.now(),
    });
  },
});

export const getContentModerationResults = query({
  args: { contentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.contentId) {
      return await ctx.db
        .query("contentModerationResults")
        .filter((q) => q.eq(q.field("contentId"), args.contentId))
        .collect();
    }
    return await ctx.db.query("contentModerationResults").collect();
  },
});

// Fact Checking
export const createFactCheckResult = mutation({
  args: {
    contentId: v.string(),
    claim: v.string(),
    isVerified: v.boolean(),
    confidence: v.number(),
    sources: v.array(v.string()),
    verificationMethod: v.string(),
    checkedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("factCheckResults", {
      ...args,
      checkedAt: Date.now(),
    });
  },
});

export const getFactCheckResults = query({
  args: { contentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.contentId) {
      return await ctx.db
        .query("factCheckResults")
        .filter((q) => q.eq(q.field("contentId"), args.contentId))
        .collect();
    }
    return await ctx.db.query("factCheckResults").collect();
  },
});

// Natural Language Understanding
export const createIntentClassification = mutation({
  args: {
    text: v.string(),
    userId: v.optional(v.string()),
    intents: v.array(v.any()),
    primaryIntent: v.any(),
    secondaryIntents: v.array(v.any()),
    context: v.any(),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("intentClassifications", {
      ...args,
      classifiedAt: Date.now(),
    });
  },
});

export const getIntentClassifications = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("intentClassifications")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("intentClassifications").collect();
  },
});

export const createEntityExtraction = mutation({
  args: {
    text: v.string(),
    userId: v.optional(v.string()),
    entities: v.array(v.any()),
    relations: v.array(v.any()),
    coreferences: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("entityExtractions", {
      ...args,
      extractedAt: Date.now(),
    });
  },
});

export const getEntityExtractions = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("entityExtractions")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("entityExtractions").collect();
  },
});

export const createSentimentAnalysis = mutation({
  args: {
    text: v.string(),
    userId: v.optional(v.string()),
    sentiment: v.any(),
    aspects: v.array(v.any()),
    intensity: v.any(),
    language: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sentimentAnalyses", {
      ...args,
      analyzedAt: Date.now(),
    });
  },
});

export const getSentimentAnalyses = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("sentimentAnalyses")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
    }
    return await ctx.db.query("sentimentAnalyses").collect();
  },
});

// Computer Vision
export const createImageAnalysis = mutation({
  args: {
    imageUrl: v.string(),
    analysis: v.any(),
    objects: v.array(v.any()),
    text: v.array(v.any()),
    faces: v.array(v.any()),
    scene: v.any(),
    colors: v.array(v.any()),
    brands: v.array(v.any()),
    quality: v.any(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("imageAnalyses", {
      ...args,
      analyzedAt: Date.now(),
    });
  },
});

export const getImageAnalyses = query({
  args: { imageUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.imageUrl) {
      return await ctx.db
        .query("imageAnalyses")
        .filter((q) => q.eq(q.field("imageUrl"), args.imageUrl))
        .collect();
    }
    return await ctx.db.query("imageAnalyses").collect();
  },
});

export const createVisualContentGeneration = mutation({
  args: {
    prompt: v.string(),
    generatedImages: v.array(v.any()),
    variations: v.array(v.any()),
    analysis: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("visualContentGenerations", {
      ...args,
      generatedAt: Date.now(),
    });
  },
});

export const getVisualContentGenerations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("visualContentGenerations").collect();
  },
});

export const createVisualSearchResult = mutation({
  args: {
    queryImage: v.string(),
    results: v.array(v.any()),
    suggestions: v.array(v.string()),
    filters: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("visualSearchResults", {
      ...args,
      searchedAt: Date.now(),
    });
  },
});

export const getVisualSearchResults = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("visualSearchResults").collect();
  },
});
