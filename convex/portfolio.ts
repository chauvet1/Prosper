import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Query: Get personal information
export const getPersonalInfo = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("personalInfo")
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .first();
  },
});

// Query: Get all skills
export const getSkills = query({
  args: { 
    category: v.optional(v.string()),
    featured: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("skills")
      .filter((q) => q.eq(q.field("active"), true));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    return await query
      .order("asc") // Sort by sortOrder
      .collect();
  },
});

// Query: Get featured skills
export const getFeaturedSkills = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

// Query: Get skills by category
export const getSkillsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

// Query: Get all experiences
export const getExperiences = query({
  args: { featured: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("experiences")
      .filter((q) => q.eq(q.field("active"), true));

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    return await query
      .order("desc") // Most recent first
      .collect();
  },
});

// Query: Get featured experiences
export const getFeaturedExperiences = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("experiences")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .collect();
  },
});

// Query: Get all projects
export const getProjects = query({
  args: { 
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("active"), true));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query
      .order("desc")
      .collect();
  },
});

// Query: Get featured projects
export const getFeaturedProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .collect();
  },
});

// Query: Get project by slug
export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!project) {
      return null;
    }

    // Increment view count
    await ctx.db.patch(project._id, {
      viewCount: project.viewCount + 1
    });

    return project;
  },
});

// Query: Get projects by category
export const getProjectsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .collect();
  },
});

// Query: Get all education
export const getEducation = query({
  args: { featured: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("education")
      .filter((q) => q.eq(q.field("active"), true));

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    return await query
      .order("desc") // Most recent first
      .collect();
  },
});

// Query: Get featured education
export const getFeaturedEducation = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("education")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .collect();
  },
});

// Query: Get all certificates
export const getCertificates = query({
  args: { 
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("certificates")
      .filter((q) => q.eq(q.field("active"), true));

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    if (args.verified !== undefined) {
      query = query.filter((q) => q.eq(q.field("verified"), args.verified));
    }

    return await query
      .order("desc") // Most recent first
      .collect();
  },
});

// Query: Get featured certificates
export const getFeaturedCertificates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .collect();
  },
});

// Mutation: Update personal info
export const updatePersonalInfo = mutation({
  args: {
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    github: v.optional(v.string()),
    avatar: v.optional(v.string()),
    aboutEn: v.optional(v.string()),
    aboutFr: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current personal info
    const current = await ctx.db
      .query("personalInfo")
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (current) {
      // Update existing
      await ctx.db.patch(current._id, args);
      return current._id;
    } else {
      // Create new
      const personalInfoId = await ctx.db.insert("personalInfo", {
        name: args.name || "",
        title: args.title || "",
        phone: args.phone,
        email: args.email || "",
        address: args.address,
        website: args.website,
        linkedin: args.linkedin,
        github: args.github,
        avatar: args.avatar,
        aboutEn: args.aboutEn || "",
        aboutFr: args.aboutFr || "",
        resumeUrl: args.resumeUrl,
        active: true,
      });
      return personalInfoId;
    }
  },
});

// Mutation: Create or update skill
export const upsertSkill = mutation({
  args: {
    id: v.optional(v.id("skills")),
    name: v.string(),
    category: v.string(),
    level: v.string(),
    yearsExp: v.optional(v.number()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      // Update existing skill
      await ctx.db.patch(args.id, {
        name: args.name,
        category: args.category as any,
        level: args.level as any,
        yearsExp: args.yearsExp,
        description: args.description,
        icon: args.icon,
        color: args.color,
        featured: args.featured || false,
        sortOrder: args.sortOrder || 0,
      });
      return args.id;
    } else {
      // Create new skill
      const skillId = await ctx.db.insert("skills", {
        name: args.name,
        category: args.category as any,
        level: args.level as any,
        yearsExp: args.yearsExp,
        description: args.description,
        icon: args.icon,
        color: args.color,
        featured: args.featured || false,
        sortOrder: args.sortOrder || 0,
        active: true,
      });
      return skillId;
    }
  },
});
