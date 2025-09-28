import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define enums as string literals for Convex
const PostStatus = v.union(
  v.literal("DRAFT"),
  v.literal("PUBLISHED"), 
  v.literal("SCHEDULED"),
  v.literal("ARCHIVED")
);

const QueueStatus = v.union(
  v.literal("PENDING"),
  v.literal("PROCESSING"),
  v.literal("COMPLETED"),
  v.literal("FAILED")
);

const SubscriberStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("UNSUBSCRIBED"),
  v.literal("BOUNCED")
);

const CampaignStatus = v.union(
  v.literal("DRAFT"),
  v.literal("SCHEDULED"),
  v.literal("SENT"),
  v.literal("FAILED")
);

const SkillCategory = v.union(
  v.literal("LANGUAGE"),
  v.literal("FRAMEWORK"),
  v.literal("DATABASE"),
  v.literal("CLOUD"),
  v.literal("TOOL"),
  v.literal("METHODOLOGY"),
  v.literal("SOFT_SKILL"),
  v.literal("NETWORKING")
);

const SkillLevel = v.union(
  v.literal("BEGINNER"),
  v.literal("INTERMEDIATE"),
  v.literal("ADVANCED"),
  v.literal("EXPERT")
);

const ProjectStatus = v.union(
  v.literal("PLANNING"),
  v.literal("IN_PROGRESS"),
  v.literal("COMPLETED"),
  v.literal("MAINTENANCE"),
  v.literal("ARCHIVED")
);

const LeadStatus = v.union(
  v.literal("NEW"),
  v.literal("CONTACTED"),
  v.literal("QUALIFIED"),
  v.literal("PROPOSAL_SENT"),
  v.literal("NEGOTIATING"),
  v.literal("CONVERTED"),
  v.literal("LOST"),
  v.literal("UNQUALIFIED")
);

const LeadPriority = v.union(
  v.literal("LOW"),
  v.literal("MEDIUM"),
  v.literal("HIGH"),
  v.literal("URGENT")
);

const AppointmentStatus = v.union(
  v.literal("SCHEDULED"),
  v.literal("CONFIRMED"),
  v.literal("COMPLETED"),
  v.literal("CANCELLED"),
  v.literal("RESCHEDULED"),
  v.literal("NO_SHOW")
);

const MeetingType = v.union(
  v.literal("VIDEO"),
  v.literal("PHONE"),
  v.literal("IN_PERSON")
);

export default defineSchema({
  // Blog System
  blogPosts: defineTable({
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
    contentType: v.string(),
    technicalLevel: v.string(),
    targetAudience: v.string(),
    status: PostStatus,
    featured: v.boolean(),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    aiGenerated: v.boolean(),
    generationConfig: v.optional(v.any()),
    aiModel: v.optional(v.string()),
    generationPrompt: v.optional(v.string()),
    readTime: v.optional(v.number()),
    wordCount: v.optional(v.number()),
    seoScore: v.number(),
    featuredImageUrl: v.optional(v.string()),
    featuredImageAltEn: v.optional(v.string()),
    featuredImageAltFr: v.optional(v.string()),
    featuredImagePrompt: v.optional(v.string()),
    imageGenerationConfig: v.optional(v.any()),
    viewCount: v.number(),
    likeCount: v.number(),
    shareCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("by_published_at", ["publishedAt"]),

  blogImages: defineTable({
    postId: v.id("blogPosts"),
    url: v.string(),
    filename: v.string(),
    altTextEn: v.string(),
    altTextFr: v.string(),
    captionEn: v.optional(v.string()),
    captionFr: v.optional(v.string()),
    prompt: v.string(),
    generationConfig: v.any(),
    aiModel: v.string(),
    style: v.string(),
    aspectRatio: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    imageType: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_post", ["postId"]),

  blogAnalytics: defineTable({
    postId: v.id("blogPosts"),
    date: v.string(), // Store as ISO date string
    views: v.number(),
    uniqueViews: v.number(),
    bounceRate: v.optional(v.number()),
    avgTimeOnPage: v.optional(v.number()),
    organicTraffic: v.number(),
    directTraffic: v.number(),
    socialTraffic: v.number(),
    referralTraffic: v.number(),
    scrollDepth: v.optional(v.number()),
    interactions: v.number(),
    shares: v.number(),
    comments: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_date", ["date"])
    .index("by_post_date", ["postId", "date"]),

  seoMetrics: defineTable({
    postId: v.id("blogPosts"),
    keyword: v.string(),
    searchVolume: v.optional(v.number()),
    competitionLevel: v.optional(v.string()),
    position: v.optional(v.number()),
    clickThroughRate: v.optional(v.number()),
    impressions: v.number(),
    clicks: v.number(),
    date: v.string(), // Store as ISO date string
  })
    .index("by_post", ["postId"])
    .index("by_keyword", ["keyword"])
    .index("by_post_keyword_date", ["postId", "keyword", "date"]),

  generationQueue: defineTable({
    topic: v.string(),
    category: v.optional(v.string()),
    contentType: v.string(),
    targetAudience: v.string(),
    technicalLevel: v.string(),
    scheduledFor: v.number(),
    priority: v.number(),
    generationConfig: v.optional(v.any()),
    seoKeywords: v.array(v.string()),
    status: QueueStatus,
    attempts: v.number(),
    errorMessage: v.optional(v.string()),
    generatedPostId: v.optional(v.id("blogPosts")),
  })
    .index("by_status", ["status"])
    .index("by_scheduled_for", ["scheduledFor"])
    .index("by_priority", ["priority"]),

  blogCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    descriptionEn: v.optional(v.string()),
    descriptionFr: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  blogTags: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    usageCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  socialShares: defineTable({
    postId: v.id("blogPosts"),
    platform: v.string(),
    shareUrl: v.optional(v.string()),
    sharedAt: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
  }).index("by_post", ["postId"]),

  // Newsletter System
  newsletterSubscribers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    language: v.string(),
    frequency: v.string(),
    categories: v.array(v.string()),
    status: SubscriberStatus,
    confirmed: v.boolean(),
    confirmationToken: v.optional(v.string()),
    subscribedAt: v.number(),
    lastEmailSent: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  emailCampaigns: defineTable({
    name: v.string(),
    subjectEn: v.optional(v.string()),
    subjectFr: v.optional(v.string()),
    contentEn: v.optional(v.string()),
    contentFr: v.optional(v.string()),
    postId: v.optional(v.id("blogPosts")),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    targetLanguage: v.optional(v.string()),
    targetCategories: v.array(v.string()),
    recipientsCount: v.number(),
    openedCount: v.number(),
    clickedCount: v.number(),
    status: CampaignStatus,
  }).index("by_status", ["status"]),

  // Portfolio System
  personalInfo: defineTable({
    name: v.string(),
    title: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    github: v.optional(v.string()),
    avatar: v.optional(v.string()),
    aboutEn: v.string(),
    aboutFr: v.string(),
    resumeUrl: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_email", ["email"]),

  skills: defineTable({
    name: v.string(),
    category: SkillCategory,
    level: SkillLevel,
    yearsExp: v.optional(v.number()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    featured: v.boolean(),
    sortOrder: v.number(),
    active: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"]),

  experiences: defineTable({
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    current: v.boolean(),
    descriptionEn: v.string(),
    descriptionFr: v.string(),
    technologies: v.array(v.string()),
    achievements: v.array(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    featured: v.boolean(),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_featured", ["featured"]),

  projects: defineTable({
    slug: v.string(),
    titleEn: v.string(),
    titleFr: v.string(),
    descriptionEn: v.string(),
    descriptionFr: v.string(),
    shortDescEn: v.optional(v.string()),
    shortDescFr: v.optional(v.string()),
    technologies: v.array(v.string()),
    category: v.string(),
    status: ProjectStatus,
    featured: v.boolean(),
    demoUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    images: v.array(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    clientName: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    myRole: v.optional(v.string()),
    challenges: v.array(v.string()),
    solutions: v.array(v.string()),
    results: v.array(v.string()),
    viewCount: v.number(),
    likeCount: v.number(),
    sortOrder: v.number(),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"])
    .index("by_category", ["category"]),

  education: defineTable({
    degree: v.string(),
    field: v.optional(v.string()),
    school: v.string(),
    location: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    current: v.boolean(),
    gpa: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    descriptionFr: v.optional(v.string()),
    achievements: v.array(v.string()),
    logo: v.optional(v.string()),
    website: v.optional(v.string()),
    featured: v.boolean(),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_featured", ["featured"]),

  certificates: defineTable({
    name: v.string(),
    issuer: v.string(),
    issueDate: v.number(),
    expiryDate: v.optional(v.number()),
    credentialId: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    skills: v.array(v.string()),
    logo: v.optional(v.string()),
    featured: v.boolean(),
    verified: v.boolean(),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_featured", ["featured"]),

  // CRM System
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    projectRequirements: v.optional(v.string()),
    estimate: v.optional(v.string()),
    source: v.string(),
    locale: v.string(),
    status: LeadStatus,
    priority: LeadPriority,
    leadScore: v.number(),
    assignedTo: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    convertedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  appointments: defineTable({
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    company: v.optional(v.string()),
    projectType: v.string(),
    description: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
    timezone: v.string(),
    status: AppointmentStatus,
    meetingType: MeetingType,
    meetingLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
    reminderSent: v.boolean(),
  })
    .index("by_email", ["clientEmail"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),
});
