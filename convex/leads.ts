import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Query: Get all leads
export const getLeads = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let leads;

    if (args.status) {
      leads = await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    } else {
      leads = await ctx.db
        .query("leads")
        .order("desc")
        .collect();
    }

    // Filter by priority if specified
    if (args.priority) {
      leads = leads.filter(lead => lead.priority === args.priority);
    }

    // Apply limit if specified
    if (args.limit) {
      leads = leads.slice(0, args.limit);
    }

    return leads;
  },
});

// Query: Get lead by ID
export const getLeadById = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get lead by email
export const getLeadByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Query: Get leads by status
export const getLeadsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Query: Get leads by priority
export const getLeadsByPriority = query({
  args: { priority: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_priority", (q) => q.eq("priority", args.priority))
      .order("desc")
      .collect();
  },
});

// Mutation: Create a new lead
export const createLead = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    projectRequirements: v.optional(v.string()),
    estimate: v.optional(v.string()),
    source: v.optional(v.string()),
    locale: v.optional(v.string()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if lead with this email already exists
    const existingLead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingLead) {
      throw new Error(`Lead with email "${args.email}" already exists`);
    }

    const leadId = await ctx.db.insert("leads", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      message: args.message,
      projectRequirements: args.projectRequirements,
      estimate: args.estimate,
      source: args.source || "website",
      locale: args.locale || "en",
      status: "NEW",
      priority: (args.priority as any) || "MEDIUM",
      leadScore: 0,
      assignedTo: undefined,
      followUpDate: undefined,
      notes: undefined,
      convertedAt: undefined,
    });

    return leadId;
  },
});

// Mutation: Update lead
export const updateLead = mutation({
  args: {
    id: v.id("leads"),
    updates: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      company: v.optional(v.string()),
      message: v.optional(v.string()),
      projectRequirements: v.optional(v.string()),
      estimate: v.optional(v.string()),
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      leadScore: v.optional(v.number()),
      assignedTo: v.optional(v.string()),
      followUpDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      convertedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.db.patch(args.id, args.updates);
    return args.id;
  },
});

// Mutation: Update lead status
export const updateLeadStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const updates: any = {
      status: args.status,
    };

    if (args.notes) {
      updates.notes = args.notes;
    }

    if (args.status === "CONVERTED") {
      updates.convertedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Mutation: Delete lead
export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query: Get all appointments
export const getAppointments = query({
  args: { 
    status: v.optional(v.string()),
    date: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("appointments");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    if (args.date) {
      query = query.withIndex("by_date", (q) => q.eq("date", args.date));
    }

    query = query.order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Query: Get appointment by ID
export const getAppointmentById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get appointments by email
export const getAppointmentsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("clientEmail", args.email))
      .order("desc")
      .collect();
  },
});

// Query: Get appointments by date
export const getAppointmentsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .order("asc")
      .collect();
  },
});

// Mutation: Create a new appointment
export const createAppointment = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    company: v.optional(v.string()),
    projectType: v.string(),
    description: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.optional(v.number()),
    timezone: v.optional(v.string()),
    meetingType: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointmentId = await ctx.db.insert("appointments", {
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      company: args.company,
      projectType: args.projectType,
      description: args.description,
      date: args.date,
      time: args.time,
      duration: args.duration || 60,
      timezone: args.timezone || "America/Toronto",
      status: "SCHEDULED",
      meetingType: (args.meetingType as any) || "VIDEO",
      meetingLink: args.meetingLink,
      notes: args.notes,
      preferredLanguage: args.preferredLanguage || "en",
      reminderSent: false,
    });

    return appointmentId;
  },
});

// Mutation: Update appointment
export const updateAppointment = mutation({
  args: {
    id: v.id("appointments"),
    updates: v.object({
      clientName: v.optional(v.string()),
      clientPhone: v.optional(v.string()),
      company: v.optional(v.string()),
      projectType: v.optional(v.string()),
      description: v.optional(v.string()),
      date: v.optional(v.string()),
      time: v.optional(v.string()),
      duration: v.optional(v.number()),
      timezone: v.optional(v.string()),
      status: v.optional(v.string()),
      meetingType: v.optional(v.string()),
      meetingLink: v.optional(v.string()),
      notes: v.optional(v.string()),
      preferredLanguage: v.optional(v.string()),
      reminderSent: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.id, args.updates);
    return args.id;
  },
});

// Mutation: Update appointment status
export const updateAppointmentStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const updates: any = {
      status: args.status,
    };

    if (args.notes) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Mutation: Delete appointment
export const deleteAppointment = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
