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

// AI System Enums
const AIModelProvider = v.union(
  v.literal("gemini"),
  v.literal("openai"),
  v.literal("anthropic"),
  v.literal("local")
);

const AIModelStatus = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("quota_exhausted"),
  v.literal("error"),
  v.literal("maintenance")
);

const ContentQualityStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_review")
);

const SentimentType = v.union(
  v.literal("positive"),
  v.literal("negative"),
  v.literal("neutral"),
  v.literal("mixed")
);

const IntentType = v.union(
  v.literal("information"),
  v.literal("purchase"),
  v.literal("support"),
  v.literal("feedback"),
  v.literal("other")
);

const EntityType = v.union(
  v.literal("PERSON"),
  v.literal("ORGANIZATION"),
  v.literal("LOCATION"),
  v.literal("DATE"),
  v.literal("TIME"),
  v.literal("MONEY"),
  v.literal("PERCENT"),
  v.literal("PRODUCT"),
  v.literal("EVENT"),
  v.literal("SKILL"),
  v.literal("TECHNOLOGY"),
  v.literal("CUSTOM")
);

const ImageAnalysisType = v.union(
  v.literal("objects"),
  v.literal("text"),
  v.literal("faces"),
  v.literal("scene"),
  v.literal("colors"),
  v.literal("brands"),
  v.literal("quality"),
  v.literal("metadata")
);

const MarketTrendImpact = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical")
);

const MarketTrendTimeframe = v.union(
  v.literal("short"),
  v.literal("medium"),
  v.literal("long")
);

const CustomerSegmentType = v.union(
  v.literal("demographic"),
  v.literal("behavioral"),
  v.literal("psychographic"),
  v.literal("geographic"),
  v.literal("value_based")
);

const RevenueOptimizationType = v.union(
  v.literal("pricing"),
  v.literal("conversion"),
  v.literal("forecast"),
  v.literal("margin"),
  v.literal("comprehensive")
);

const EmailCampaignType = v.union(
  v.literal("newsletter"),
  v.literal("promotional"),
  v.literal("transactional"),
  v.literal("welcome"),
  v.literal("abandoned_cart"),
  v.literal("re_engagement")
);

const EmailCampaignStatus = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("sending"),
  v.literal("sent"),
  v.literal("paused"),
  v.literal("cancelled"),
  v.literal("failed")
);

const SocialMediaPlatform = v.union(
  v.literal("facebook"),
  v.literal("twitter"),
  v.literal("instagram"),
  v.literal("linkedin"),
  v.literal("youtube"),
  v.literal("tiktok"),
  v.literal("pinterest")
);

const SocialMediaPostStatus = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("deleted")
);

const CRMTaskStatus = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("overdue")
);

const CRMTaskPriority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent")
);

const CRMDealStatus = v.union(
  v.literal("prospecting"),
  v.literal("qualification"),
  v.literal("proposal"),
  v.literal("negotiation"),
  v.literal("closed_won"),
  v.literal("closed_lost")
);

const CRMPipelineStage = v.union(
  v.literal("lead"),
  v.literal("qualified"),
  v.literal("proposal"),
  v.literal("negotiation"),
  v.literal("closed")
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

  // AI System Tables
  aiModels: defineTable({
    id: v.string(),
    name: v.string(),
    provider: AIModelProvider,
    model: v.string(),
    apiKey: v.optional(v.string()),
    endpoint: v.optional(v.string()),
    maxTokens: v.number(),
    costPerToken: v.number(),
    quotaLimit: v.number(),
    quotaUsed: v.number(),
    quotaResetTime: v.number(),
    priority: v.number(),
    isAvailable: v.boolean(),
    status: AIModelStatus,
    lastError: v.optional(v.string()),
    quotaPercentage: v.number(),
    quotaWarningThreshold: v.number(),
    quotaCriticalThreshold: v.number(),
    lastQuotaCheck: v.number(),
  })
    .index("by_provider", ["provider"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  contentQualityAssessments: defineTable({
    contentId: v.string(),
    contentType: v.string(),
    qualityScore: v.number(),
    grammarScore: v.number(),
    readabilityScore: v.number(),
    seoScore: v.number(),
    technicalAccuracyScore: v.number(),
    brandVoiceScore: v.number(),
    status: ContentQualityStatus,
    issues: v.array(v.string()),
    recommendations: v.array(v.string()),
    assessedAt: v.number(),
    assessedBy: v.optional(v.string()),
  })
    .index("by_content", ["contentId"])
    .index("by_status", ["status"])
    .index("by_score", ["qualityScore"]),

  contentModerationResults: defineTable({
    contentId: v.string(),
    contentType: v.string(),
    isAppropriate: v.boolean(),
    toxicityScore: v.number(),
    biasScore: v.number(),
    spamScore: v.number(),
    brandSafetyScore: v.number(),
    flaggedIssues: v.array(v.string()),
    moderationActions: v.array(v.string()),
    moderatedAt: v.number(),
    moderatedBy: v.optional(v.string()),
  })
    .index("by_content", ["contentId"])
    .index("by_appropriate", ["isAppropriate"])
    .index("by_toxicity", ["toxicityScore"]),

  factCheckResults: defineTable({
    contentId: v.string(),
    claim: v.string(),
    isVerified: v.boolean(),
    confidence: v.number(),
    sources: v.array(v.string()),
    verificationMethod: v.string(),
    checkedAt: v.number(),
    checkedBy: v.optional(v.string()),
  })
    .index("by_content", ["contentId"])
    .index("by_verified", ["isVerified"])
    .index("by_confidence", ["confidence"]),

  // Natural Language Understanding
  intentClassifications: defineTable({
    text: v.string(),
    userId: v.optional(v.string()),
    intents: v.array(v.any()),
    primaryIntent: v.any(),
    secondaryIntents: v.array(v.any()),
    context: v.any(),
    confidence: v.number(),
    classifiedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_confidence", ["confidence"])
    .index("by_date", ["classifiedAt"]),

  entityExtractions: defineTable({
    text: v.string(),
    userId: v.optional(v.string()),
    entities: v.array(v.any()),
    relations: v.array(v.any()),
    coreferences: v.array(v.any()),
    extractedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["extractedAt"]),

  sentimentAnalyses: defineTable({
    text: v.string(),
    userId: v.optional(v.string()),
    sentiment: v.any(),
    aspects: v.array(v.any()),
    intensity: v.any(),
    language: v.any(),
    analyzedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sentiment", ["sentiment"])
    .index("by_date", ["analyzedAt"]),

  // Computer Vision
  imageAnalyses: defineTable({
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
    analyzedAt: v.number(),
  })
    .index("by_image", ["imageUrl"])
    .index("by_date", ["analyzedAt"]),

  visualContentGenerations: defineTable({
    prompt: v.string(),
    generatedImages: v.array(v.any()),
    variations: v.array(v.any()),
    analysis: v.any(),
    generatedAt: v.number(),
  })
    .index("by_date", ["generatedAt"]),

  visualSearchResults: defineTable({
    queryImage: v.string(),
    results: v.array(v.any()),
    suggestions: v.array(v.string()),
    filters: v.any(),
    searchedAt: v.number(),
  })
    .index("by_date", ["searchedAt"]),

  // Market Intelligence
  industryTrends: defineTable({
    industry: v.string(),
    trend: v.string(),
    description: v.string(),
    impact: MarketTrendImpact,
    timeframe: MarketTrendTimeframe,
    confidence: v.number(),
    sources: v.array(v.string()),
    metrics: v.any(),
    implications: v.array(v.string()),
    opportunities: v.array(v.string()),
    threats: v.array(v.string()),
    recommendations: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_industry", ["industry"])
    .index("by_impact", ["impact"])
    .index("by_timeframe", ["timeframe"]),

  competitiveAnalyses: defineTable({
    company: v.string(),
    industry: v.string(),
    analysis: v.any(),
    financials: v.any(),
    products: v.array(v.any()),
    marketing: v.any(),
    technology: v.any(),
    recommendations: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_company", ["company"])
    .index("by_industry", ["industry"])
    .index("by_date", ["createdAt"]),

  marketOpportunities: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_market", ["market"])
    .index("by_priority", ["priority"])
    .index("by_score", ["score"]),

  // Customer Insights
  userBehaviorAnalyses: defineTable({
    userId: v.string(),
    analysis: v.any(),
    insights: v.array(v.string()),
    recommendations: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),

  customerJourneys: defineTable({
    userId: v.string(),
    journey: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),

  customerSegments: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_size", ["size"])
    .index("by_date", ["createdAt"]),

  lifetimeValuePredictions: defineTable({
    userId: v.string(),
    prediction: v.any(),
    recommendations: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),

  churnPredictions: defineTable({
    userId: v.string(),
    prediction: v.any(),
    interventions: v.array(v.any()),
    recommendations: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),

  // Revenue Optimization
  pricingOptimizations: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["product"])
    .index("by_confidence", ["confidence"])
    .index("by_date", ["createdAt"]),

  conversionOptimizations: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_funnel", ["funnel"])
    .index("by_improvement", ["improvement"])
    .index("by_date", ["createdAt"]),

  revenueForecasts: defineTable({
    period: v.any(),
    forecast: v.any(),
    breakdown: v.any(),
    drivers: v.array(v.any()),
    scenarios: v.array(v.any()),
    risks: v.array(v.any()),
    opportunities: v.array(v.any()),
    recommendations: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["createdAt"]),

  profitMarginAnalyses: defineTable({
    period: v.any(),
    analysis: v.any(),
    breakdown: v.any(),
    costs: v.any(),
    optimization: v.any(),
    benchmarks: v.any(),
    recommendations: v.array(v.string()),
    risks: v.array(v.string()),
    implementation: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["createdAt"]),

  // Email Marketing System
  emailMarketingCampaigns: defineTable({
    name: v.string(),
    subject: v.string(),
    fromName: v.string(),
    fromEmail: v.string(),
    replyTo: v.optional(v.string()),
    type: EmailCampaignType,
    status: EmailCampaignStatus,
    template: v.any(),
    content: v.any(),
    recipients: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    metrics: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_date", ["createdAt"]),

  emailLists: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    subscribers: v.array(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_date", ["createdAt"]),

  emailSubscribers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    status: v.string(),
    tags: v.array(v.string()),
    preferences: v.any(),
    subscribedAt: v.number(),
    lastActivity: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_date", ["subscribedAt"]),

  emailAutomations: defineTable({
    name: v.string(),
    description: v.string(),
    trigger: v.string(),
    conditions: v.array(v.any()),
    actions: v.array(v.any()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_trigger", ["trigger"])
    .index("by_date", ["createdAt"]),

  emailTemplates: defineTable({
    name: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
    preview: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_date", ["createdAt"]),

  emailAnalytics: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_list", ["listId"])
    .index("by_date", ["createdAt"]),

  // Social Media Automation
  socialMediaAccounts: defineTable({
    platform: SocialMediaPlatform,
    username: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    isActive: v.boolean(),
    lastSync: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_platform", ["platform"])
    .index("by_username", ["username"])
    .index("by_active", ["isActive"]),

  socialMediaPosts: defineTable({
    accountId: v.string(),
    content: v.string(),
    media: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    status: SocialMediaPostStatus,
    platform: SocialMediaPlatform,
    engagement: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_status", ["status"])
    .index("by_platform", ["platform"])
    .index("by_date", ["createdAt"]),

  socialMediaCampaigns: defineTable({
    name: v.string(),
    description: v.string(),
    platforms: v.array(SocialMediaPlatform),
    posts: v.array(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),
    status: v.string(),
    metrics: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  socialMediaAnalytics: defineTable({
    accountId: v.string(),
    period: v.any(),
    metrics: v.any(),
    engagement: v.any(),
    reach: v.any(),
    impressions: v.any(),
    clicks: v.any(),
    shares: v.any(),
    comments: v.any(),
    likes: v.any(),
    createdAt: v.number(),
  })
    .index("by_account", ["accountId"])
    .index("by_date", ["createdAt"]),

  // Internal CRM
  crmContacts: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    lastContact: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_company", ["company"])
    .index("by_date", ["createdAt"]),

  crmDeals: defineTable({
    title: v.string(),
    contactId: v.string(),
    value: v.number(),
    currency: v.string(),
    status: CRMDealStatus,
    stage: CRMPipelineStage,
    probability: v.number(),
    expectedCloseDate: v.optional(v.number()),
    actualCloseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"])
    .index("by_stage", ["stage"])
    .index("by_value", ["value"]),

  crmTasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    contactId: v.optional(v.string()),
    dealId: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: CRMTaskStatus,
    priority: CRMTaskPriority,
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contact", ["contactId"])
    .index("by_deal", ["dealId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_due_date", ["dueDate"]),

  crmCommunications: defineTable({
    contactId: v.string(),
    type: v.string(),
    subject: v.optional(v.string()),
    content: v.string(),
    direction: v.string(),
    timestamp: v.number(),
    relatedDealId: v.optional(v.string()),
    relatedTaskId: v.optional(v.string()),
  })
    .index("by_contact", ["contactId"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  crmPipelines: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    stages: v.array(v.any()),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_default", ["isDefault"])
    .index("by_date", ["createdAt"]),

  crmReports: defineTable({
    name: v.string(),
    type: v.string(),
    parameters: v.any(),
    data: v.any(),
    generatedAt: v.number(),
    generatedBy: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_date", ["generatedAt"]),

  crmAutomations: defineTable({
    name: v.string(),
    description: v.string(),
    trigger: v.string(),
    conditions: v.array(v.any()),
    actions: v.array(v.any()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"])
    .index("by_trigger", ["trigger"])
    .index("by_date", ["createdAt"]),

  crmBackups: defineTable({
    type: v.string(),
    data: v.any(),
    size: v.number(),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_type", ["type"])
    .index("by_date", ["createdAt"]),

  // User management for WorkOS AuthKit
  users: defineTable({
    workosId: v.optional(v.string()), // WorkOS user ID (optional for backward compatibility)
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.union(v.string(), v.null())),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    role: v.optional(v.string()), // 'admin' or 'client'
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      language: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
    })),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
