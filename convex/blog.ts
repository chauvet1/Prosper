import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Query: Get all published blog posts
export const getPublishedPosts = query({
  args: { 
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    featured: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.featured !== undefined) {
      query = query.filter((q) => q.eq(q.field("featured"), args.featured));
    }

    const posts = await query.order("desc").collect();

    if (args.limit) {
      return posts.slice(0, args.limit);
    }

    return posts;
  },
});

// Query: Get blog post by ID
export const getPostById = query({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    
    if (!post || post.status !== "PUBLISHED") {
      return null;
    }

    // Increment view count
    await ctx.db.patch(args.id, {
      viewCount: post.viewCount + 1
    });

    return post;
  },
});

// Query: Get blog post by slug (read-only)
export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "PUBLISHED"))
      .first();

    return post;
  },
});

// Mutation: Increment view count for a post
export const incrementViewCount = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.postId, {
      viewCount: post.viewCount + 1
    });

    return { success: true, newViewCount: post.viewCount + 1 };
  },
});

// Query: Get blog images for a post
export const getPostImages = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blogImages")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Query: Get featured posts
export const getFeaturedPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogPosts")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("status"), "PUBLISHED"))
      .order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Query: Get recent posts
export const getRecentPosts = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
      .order("desc")
      .take(args.limit)
      .collect();
  },
});

// Query: Get posts by category
export const getPostsByCategory = query({
  args: { 
    category: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogPosts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), "PUBLISHED"))
      .order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Mutation: Create a new blog post
export const createPost = mutation({
  args: {
    slug: v.string(),
    titleEn: v.string(),
    titleFr: v.string(),
    excerptEn: v.optional(v.string()),
    excerptFr: v.optional(v.string()),
    contentEn: v.string(),
    contentFr: v.string(),
    metaDescriptionEn: v.optional(v.string()),
    metaDescriptionFr: v.optional(v.string()),
    keywords: v.array(v.string()),
    tags: v.array(v.string()),
    category: v.string(),
    contentType: v.optional(v.string()),
    technicalLevel: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    aiGenerated: v.optional(v.boolean()),
    generationConfig: v.optional(v.any()),
    aiModel: v.optional(v.string()),
    generationPrompt: v.optional(v.string()),
    readTime: v.optional(v.number()),
    wordCount: v.optional(v.number()),
    seoScore: v.optional(v.number()),
    featuredImageUrl: v.optional(v.string()),
    featuredImageAltEn: v.optional(v.string()),
    featuredImageAltFr: v.optional(v.string()),
    featuredImagePrompt: v.optional(v.string()),
    imageGenerationConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existingPost = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingPost) {
      throw new Error(`Post with slug "${args.slug}" already exists`);
    }

    const postId = await ctx.db.insert("blogPosts", {
      slug: args.slug,
      titleEn: args.titleEn,
      titleFr: args.titleFr,
      excerptEn: args.excerptEn,
      excerptFr: args.excerptFr,
      contentEn: args.contentEn,
      contentFr: args.contentFr,
      metaDescriptionEn: args.metaDescriptionEn,
      metaDescriptionFr: args.metaDescriptionFr,
      keywords: args.keywords,
      tags: args.tags,
      category: args.category,
      contentType: args.contentType || "article",
      technicalLevel: args.technicalLevel || "intermediate",
      targetAudience: args.targetAudience || "developers",
      status: "DRAFT",
      featured: args.featured || false,
      publishedAt: undefined,
      scheduledFor: undefined,
      aiGenerated: args.aiGenerated || false,
      generationConfig: args.generationConfig,
      aiModel: args.aiModel,
      generationPrompt: args.generationPrompt,
      readTime: args.readTime,
      wordCount: args.wordCount,
      seoScore: args.seoScore || 0,
      featuredImageUrl: args.featuredImageUrl,
      featuredImageAltEn: args.featuredImageAltEn,
      featuredImageAltFr: args.featuredImageAltFr,
      featuredImagePrompt: args.featuredImagePrompt,
      imageGenerationConfig: args.imageGenerationConfig,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
    });

    return postId;
  },
});

// Mutation: Update blog post
export const updatePost = mutation({
  args: {
    id: v.id("blogPosts"),
    updates: v.object({
      titleEn: v.optional(v.string()),
      titleFr: v.optional(v.string()),
      excerptEn: v.optional(v.string()),
      excerptFr: v.optional(v.string()),
      contentEn: v.optional(v.string()),
      contentFr: v.optional(v.string()),
      metaDescriptionEn: v.optional(v.string()),
      metaDescriptionFr: v.optional(v.string()),
      keywords: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      featured: v.optional(v.boolean()),
      status: v.optional(v.union(
        v.literal("DRAFT"),
        v.literal("PUBLISHED"),
        v.literal("SCHEDULED"),
        v.literal("ARCHIVED")
      )),
      publishedAt: v.optional(v.number()),
      scheduledFor: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.id, args.updates);
    return args.id;
  },
});

// Mutation: Delete blog post
export const deletePost = mutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    // Delete related images
    const images = await ctx.db
      .query("blogImages")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    for (const image of images) {
      await ctx.db.delete(image._id);
    }

    // Delete related analytics
    const analytics = await ctx.db
      .query("blogAnalytics")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    for (const analytic of analytics) {
      await ctx.db.delete(analytic._id);
    }

    // Delete the post
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutation: Publish a post
export const publishPost = mutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.id, {
      status: "PUBLISHED",
      publishedAt: Date.now(),
    });

    return args.id;
  },
});
