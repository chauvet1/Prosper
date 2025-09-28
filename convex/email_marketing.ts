import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Email Campaigns
export const createEmailCampaign = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    fromName: v.string(),
    fromEmail: v.string(),
    replyTo: v.optional(v.string()),
    type: v.string(),
    status: v.string(),
    template: v.any(),
    content: v.any(),
    recipients: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailMarketingCampaigns", {
      ...args,
      sentAt: undefined,
      metrics: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getEmailCampaigns = query({
  args: { 
    status: v.optional(v.string()),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailMarketingCampaigns");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    return await query.collect();
  },
});

export const updateEmailCampaign = mutation({
  args: {
    id: v.id("emailMarketingCampaigns"),
    name: v.optional(v.string()),
    subject: v.optional(v.string()),
    fromName: v.optional(v.string()),
    fromEmail: v.optional(v.string()),
    replyTo: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    template: v.optional(v.any()),
    content: v.optional(v.any()),
    recipients: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
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

// Email Lists
export const createEmailList = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    subscribers: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailLists", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getEmailLists = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("emailLists").collect();
  },
});

export const updateEmailList = mutation({
  args: {
    id: v.id("emailLists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    subscribers: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Email Subscribers
export const createEmailSubscriber = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    status: v.string(),
    tags: v.array(v.string()),
    preferences: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailSubscribers", {
      ...args,
      subscribedAt: Date.now(),
      lastActivity: undefined,
    });
  },
});

export const getEmailSubscribers = query({
  args: { 
    status: v.optional(v.string()),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailSubscribers");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.tags && args.tags.length > 0) {
      query = query.filter((q) => 
        q.or(...args.tags!.map(tag => q.eq(q.field("tags"), tag)))
      );
    }
    
    return await query.collect();
  },
});

export const updateEmailSubscriber = mutation({
  args: {
    id: v.id("emailSubscribers"),
    name: v.optional(v.string()),
    status: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    preferences: v.optional(v.any()),
    lastActivity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Email Automations
export const createEmailAutomation = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    trigger: v.string(),
    conditions: v.array(v.any()),
    actions: v.array(v.any()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailAutomations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getEmailAutomations = query({
  args: { 
    status: v.optional(v.string()),
    trigger: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailAutomations");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.trigger) {
      query = query.filter((q) => q.eq(q.field("trigger"), args.trigger));
    }
    
    return await query.collect();
  },
});

export const updateEmailAutomation = mutation({
  args: {
    id: v.id("emailAutomations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.string()),
    conditions: v.optional(v.array(v.any())),
    actions: v.optional(v.array(v.any())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Email Templates
export const createEmailTemplate = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
    preview: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailTemplates", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getEmailTemplates = query({
  args: { 
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailTemplates");
    
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    if (args.tags && args.tags.length > 0) {
      query = query.filter((q) => 
        q.or(...args.tags!.map(tag => q.eq(q.field("tags"), tag)))
      );
    }
    
    return await query.collect();
  },
});

export const updateEmailTemplate = mutation({
  args: {
    id: v.id("emailTemplates"),
    name: v.optional(v.string()),
    subject: v.optional(v.string()),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
    preview: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Email Analytics
export const createEmailAnalytics = mutation({
  args: {
    campaignId: v.optional(v.string()),
    listId: v.optional(v.string()),
    period: v.any(),
    metrics: v.any(),
    rates: v.any(),
    trends: v.any(),
    topLinks: v.any(),
    topCountries: v.any(),
    topDevices: v.any(),
    insights: v.array(v.string()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailAnalytics", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getEmailAnalytics = query({
  args: { 
    campaignId: v.optional(v.string()),
    listId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailAnalytics");
    
    if (args.campaignId) {
      query = query.filter((q) => q.eq(q.field("campaignId"), args.campaignId));
    }
    if (args.listId) {
      query = query.filter((q) => q.eq(q.field("listId"), args.listId));
    }
    
    return await query.collect();
  },
});
