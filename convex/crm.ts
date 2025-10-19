import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// CRM Contacts
export const createCRMContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmContacts", {
      ...args,
      lastContact: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCRMContacts = query({
  args: { 
    company: v.optional(v.string()),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmContacts");
    
    if (args.company) {
      query = query.filter((q) => q.eq(q.field("company"), args.company));
    }
    if (args.tags && args.tags.length > 0) {
      query = query.filter((q) => 
        q.or(...args.tags!.map(tag => q.eq(q.field("tags"), tag)))
      );
    }
    
    return await query.collect();
  },
});

export const updateCRMContact = mutation({
  args: {
    id: v.id("crmContacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    lastContact: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// CRM Deals
export const createCRMDeal = mutation({
  args: {
    title: v.string(),
    contactId: v.string(),
    value: v.number(),
    currency: v.string(),
    status: v.string(),
    stage: v.string(),
    probability: v.number(),
    expectedCloseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmDeals", {
      ...args,
      actualCloseDate: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCRMDeals = query({
  args: { 
    contactId: v.optional(v.string()),
    status: v.optional(v.string()),
    stage: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmDeals");
    
    if (args.contactId) {
      query = query.filter((q) => q.eq(q.field("contactId"), args.contactId));
    }
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.stage) {
      query = query.filter((q) => q.eq(q.field("stage"), args.stage));
    }
    
    return await query.collect();
  },
});

export const updateCRMDeal = mutation({
  args: {
    id: v.id("crmDeals"),
    title: v.optional(v.string()),
    contactId: v.optional(v.string()),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    status: v.optional(v.string()),
    stage: v.optional(v.string()),
    probability: v.optional(v.number()),
    expectedCloseDate: v.optional(v.number()),
    actualCloseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// CRM Tasks
export const createCRMTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    contactId: v.optional(v.string()),
    dealId: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmTasks", {
      ...args,
      completedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCRMTasks = query({
  args: { 
    contactId: v.optional(v.string()),
    dealId: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmTasks");
    
    if (args.contactId) {
      query = query.filter((q) => q.eq(q.field("contactId"), args.contactId));
    }
    if (args.dealId) {
      query = query.filter((q) => q.eq(q.field("dealId"), args.dealId));
    }
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.priority) {
      query = query.filter((q) => q.eq(q.field("priority"), args.priority));
    }
    
    return await query.collect();
  },
});

export const updateCRMTask = mutation({
  args: {
    id: v.id("crmTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    contactId: v.optional(v.string()),
    dealId: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// CRM Communications
export const createCRMCommunication = mutation({
  args: {
    contactId: v.string(),
    type: v.string(),
    subject: v.optional(v.string()),
    content: v.string(),
    direction: v.string(),
    timestamp: v.number(),
    relatedDealId: v.optional(v.string()),
    relatedTaskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmCommunications", args);
  },
});

export const getCRMCommunications = query({
  args: { 
    contactId: v.optional(v.string()),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmCommunications");
    
    if (args.contactId) {
      query = query.filter((q) => q.eq(q.field("contactId"), args.contactId));
    }
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    return await query.collect();
  },
});

// CRM Pipelines
export const createCRMPipeline = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    stages: v.array(v.any()),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmPipelines", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCRMPipelines = query({
  args: { isDefault: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmPipelines");
    
    if (args.isDefault !== undefined) {
      query = query.filter((q) => q.eq(q.field("isDefault"), args.isDefault));
    }
    
    return await query.collect();
  },
});

export const updateCRMPipeline = mutation({
  args: {
    id: v.id("crmPipelines"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    stages: v.optional(v.array(v.any())),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// CRM Reports
export const createCRMReport = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    parameters: v.any(),
    data: v.any(),
    generatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmReports", {
      ...args,
      generatedAt: Date.now(),
    });
  },
});

export const getCRMReports = query({
  args: { 
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmReports");
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    return await query.collect();
  },
});

// CRM Automations
export const createCRMAutomation = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    trigger: v.string(),
    conditions: v.array(v.any()),
    actions: v.array(v.any()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmAutomations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCRMAutomations = query({
  args: { 
    isActive: v.optional(v.boolean()),
    trigger: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmAutomations");
    
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }
    if (args.trigger) {
      query = query.filter((q) => q.eq(q.field("trigger"), args.trigger));
    }
    
    return await query.collect();
  },
});

export const updateCRMAutomation = mutation({
  args: {
    id: v.id("crmAutomations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.string()),
    conditions: v.optional(v.array(v.any())),
    actions: v.optional(v.array(v.any())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// CRM Backups
export const createCRMBackup = mutation({
  args: {
    type: v.string(),
    data: v.any(),
    size: v.number(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmBackups", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getCRMBackups = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("crmBackups");
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    return await query.collect();
  },
});
