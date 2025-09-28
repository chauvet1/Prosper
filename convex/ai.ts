import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Model Configuration
interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'local';
  model: string;
  maxTokens: number;
  costPerToken: number;
  quotaLimit: number;
  quotaUsed: number;
  priority: number;
  isAvailable: boolean;
  lastError?: string;
}

// Initialize AI models
function initializeAIModels(): Map<string, AIModel> {
  const models = new Map<string, AIModel>();

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    // Gemini 2.5 Flash (Primary)
    models.set('gemini-2.5-flash', {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      maxTokens: 8192,
      costPerToken: 0.000075,
      quotaLimit: 2000,
      quotaUsed: 0,
      priority: 1,
      isAvailable: true,
    });

    // Gemini 1.5 Flash (Secondary)
    models.set('gemini-1.5-flash', {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      maxTokens: 8192,
      costPerToken: 0.000075,
      quotaLimit: 1500,
      quotaUsed: 0,
      priority: 2,
      isAvailable: true,
    });
  }

  // Local fallback
  models.set('local-fallback', {
    id: 'local-fallback',
    name: 'Local Fallback',
    provider: 'local',
    model: 'local',
    maxTokens: 4096,
    costPerToken: 0,
    quotaLimit: 999999,
    quotaUsed: 0,
    priority: 10,
    isAvailable: true,
  });

  return models;
}

// Get available model with fallback
function getAvailableModel(models: Map<string, AIModel>): AIModel {
  const sortedModels = Array.from(models.values())
    .filter(model => model.isAvailable && model.quotaUsed < model.quotaLimit)
    .sort((a, b) => a.priority - b.priority);

  return sortedModels[0] || models.get('local-fallback')!;
}

// Call Gemini API
async function callGeminiModel(model: AIModel, prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const geminiModel = genAI.getGenerativeModel({ model: model.model });

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Local fallback responses
function getLocalFallbackResponse(prompt: string, context?: string): string {
  const responses = {
    portfolio: {
      en: "I'd be happy to help with your portfolio! I can assist with showcasing your projects, skills, and experience. What specific aspect would you like to work on?",
      fr: "Je serais ravi de vous aider avec votre portfolio ! Je peux vous assister pour présenter vos projets, compétences et expérience. Sur quel aspect spécifique aimeriez-vous travailler ?"
    },
    blog: {
      en: "I can help you with blog content creation, SEO optimization, and content strategy. What type of blog post are you looking to create?",
      fr: "Je peux vous aider avec la création de contenu de blog, l'optimisation SEO et la stratégie de contenu. Quel type d'article de blog souhaitez-vous créer ?"
    },
    projects: {
      en: "I can provide insights about your projects, suggest improvements, or help with project documentation. Which project interests you?",
      fr: "Je peux fournir des insights sur vos projets, suggérer des améliorations ou aider avec la documentation. Quel projet vous intéresse ?"
    },
    default: {
      en: "I'm here to help! I can assist with web development, project planning, content creation, and technical questions. How can I help you today?",
      fr: "Je suis là pour vous aider ! Je peux vous assister avec le développement web, la planification de projets, la création de contenu et les questions techniques. Comment puis-je vous aider aujourd'hui ?"
    }
  };

  // Simple language detection
  const isFrench = /\b(bonjour|salut|comment|pourquoi|où|quand|français|merci)\b/i.test(prompt);
  const locale = isFrench ? 'fr' : 'en';

  const contextResponses = responses[context as keyof typeof responses] || responses.default;
  return contextResponses[locale];
}

// Action: AI Assistant Chat
export const aiAssistant = action({
  args: {
    message: v.string(),
    context: v.optional(v.string()),
    pageContext: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    conversationHistory: v.optional(v.array(v.any())),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const { message, context, pageContext, sessionId, conversationHistory, locale } = args;

    // Initialize AI models
    const models = initializeAIModels();
    const targetModel = getAvailableModel(models);

    try {
      let content: string;

      // Enhanced prompt with context
      const enhancedPrompt = `
Context: ${context || 'general'}
Page: ${pageContext || 'unknown'}
Language: ${locale || 'en'}
User Message: ${message}

Please provide a helpful, contextual response. If this is about portfolio, focus on professional development. If about projects, provide technical insights. If about blog, help with content strategy.
`;

      if (targetModel.provider === 'gemini') {
        content = await callGeminiModel(targetModel, enhancedPrompt);

        // Update usage
        const tokensUsed = Math.ceil(content.length / 4);
        targetModel.quotaUsed += tokensUsed;
      } else {
        content = getLocalFallbackResponse(message, context);
      }

      const response = {
        message: content,
        context: context || "general",
        sessionId: sessionId || "default",
        timestamp: Date.now(),
        model: targetModel.name,
        tokensUsed: Math.ceil(content.length / 4),
        cost: Math.ceil(content.length / 4) * targetModel.costPerToken,
        responseTime: Date.now() - startTime,
      };

      return response;
    } catch (error) {
      // Fallback to local response on error
      const fallbackContent = getLocalFallbackResponse(message, context);

      return {
        message: fallbackContent,
        context: context || "general",
        sessionId: sessionId || "default",
        timestamp: Date.now(),
        model: "Local Fallback",
        tokensUsed: 0,
        cost: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Action: AI Project Estimator
export const aiProjectEstimator = action({
  args: {
    projectDescription: v.string(),
    requirements: v.array(v.string()),
    timeline: v.optional(v.string()),
    budget: v.optional(v.string()),
    complexity: v.optional(v.string()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This will be implemented with the AI model manager
    // For now, return a placeholder response
    
    const { projectDescription, requirements, timeline, budget, complexity, locale } = args;
    
    // Rate limiting would be implemented here
    // AI model manager integration would be here
    
    // Placeholder response
    const estimate = {
      projectDescription,
      estimatedHours: 40,
      estimatedCost: "$2,000 - $5,000",
      timeline: "2-4 weeks",
      complexity: complexity || "medium",
      breakdown: [
        { phase: "Planning & Design", hours: 8, cost: "$400 - $800" },
        { phase: "Development", hours: 24, cost: "$1,200 - $2,400" },
        { phase: "Testing & Deployment", hours: 8, cost: "$400 - $800" },
      ],
      recommendations: [
        "Consider using modern frameworks for better performance",
        "Implement responsive design for mobile compatibility",
        "Plan for SEO optimization from the start",
      ],
      nextSteps: [
        "Schedule a consultation call",
        "Provide detailed requirements document",
        "Review and approve project proposal",
      ],
      timestamp: Date.now(),
      model: "placeholder",
    };

    return estimate;
  },
});

// Blog generation system prompts
const BLOG_SYSTEM_PROMPTS = {
  tutorial: `You are an expert full-stack developer and technical writer. Create comprehensive, step-by-step tutorials that are practical and actionable. Include code examples, best practices, and common pitfalls to avoid.`,
  analysis: `You are a senior software architect and industry analyst. Provide deep technical analysis with insights into trends, performance comparisons, and strategic recommendations.`,
  news: `You are a tech journalist specializing in web development. Create engaging news content that explains the impact and implications of new technologies and industry developments.`,
  opinion: `You are a thought leader in web development. Share informed opinions backed by experience, data, and industry knowledge. Be authentic and provide unique perspectives.`,
  guide: `You are an experienced developer mentor. Create practical guides that help developers solve real-world problems with clear explanations and actionable steps.`,
};

// Generate blog content with AI
async function generateBlogContent(config: {
  topic: string;
  targetAudience: string;
  contentType: string;
  technicalLevel: string;
  keywords: string[];
  locale: string;
  wordCount?: number;
}): Promise<{
  title: { en: string; fr: string };
  content: { en: string; fr: string };
  excerpt: { en: string; fr: string };
  tags: string[];
  seoMetaDescription: { en: string; fr: string };
  readTime: number;
  wordCount: number;
}> {
  const models = initializeAIModels();
  const targetModel = getAvailableModel(models);

  const systemPrompt = BLOG_SYSTEM_PROMPTS[config.contentType as keyof typeof BLOG_SYSTEM_PROMPTS] || BLOG_SYSTEM_PROMPTS.guide;

  const prompt = `
${systemPrompt}

Topic: ${config.topic}
Target Audience: ${config.targetAudience}
Content Type: ${config.contentType}
Technical Level: ${config.technicalLevel}
SEO Keywords: ${config.keywords.join(', ')}
Language: ${config.locale}
Word Count Target: ${config.wordCount || 1000}

Create a comprehensive blog post that includes:
1. Engaging title in both English and French
2. Full article content with proper structure (introduction, main sections, conclusion)
3. Compelling excerpt/summary
4. Relevant tags
5. SEO meta description
6. Estimated read time

Format the response as JSON with this structure:
{
  "title": {"en": "...", "fr": "..."},
  "content": {"en": "...", "fr": "..."},
  "excerpt": {"en": "...", "fr": "..."},
  "tags": ["tag1", "tag2", "tag3"],
  "seoMetaDescription": {"en": "...", "fr": "..."},
  "readTime": 5,
  "wordCount": 1000
}

Make the content engaging, informative, and optimized for SEO while maintaining high quality and accuracy.
`;

  try {
    let response: string;

    if (targetModel.provider === 'gemini') {
      response = await callGeminiModel(targetModel, prompt);

      // Update usage
      const tokensUsed = Math.ceil(response.length / 4);
      targetModel.quotaUsed += tokensUsed;
    } else {
      // Fallback response
      response = JSON.stringify({
        title: {
          en: `${config.topic}: A Comprehensive Guide`,
          fr: `${config.topic}: Un Guide Complet`
        },
        content: {
          en: `This is a comprehensive guide about ${config.topic} designed for ${config.targetAudience}. This content would be generated by AI in a production environment.`,
          fr: `Ceci est un guide complet sur ${config.topic} conçu pour ${config.targetAudience}. Ce contenu serait généré par IA dans un environnement de production.`
        },
        excerpt: {
          en: `Learn everything you need to know about ${config.topic}`,
          fr: `Apprenez tout ce que vous devez savoir sur ${config.topic}`
        },
        tags: config.keywords.slice(0, 5),
        seoMetaDescription: {
          en: `Complete guide to ${config.topic} for ${config.targetAudience}`,
          fr: `Guide complet de ${config.topic} pour ${config.targetAudience}`
        },
        readTime: Math.ceil((config.wordCount || 1000) / 200),
        wordCount: config.wordCount || 1000
      });
    }

    // Parse JSON response
    try {
      return JSON.parse(response);
    } catch {
      // If JSON parsing fails, create structured response
      return {
        title: {
          en: `${config.topic}: A Comprehensive Guide`,
          fr: `${config.topic}: Un Guide Complet`
        },
        content: {
          en: response.substring(0, Math.min(response.length, 2000)),
          fr: `Version française du contenu généré sur ${config.topic}.`
        },
        excerpt: {
          en: `Learn about ${config.topic}`,
          fr: `Apprenez sur ${config.topic}`
        },
        tags: config.keywords.slice(0, 5),
        seoMetaDescription: {
          en: `Guide to ${config.topic}`,
          fr: `Guide de ${config.topic}`
        },
        readTime: Math.ceil((config.wordCount || 1000) / 200),
        wordCount: config.wordCount || 1000
      };
    }
  } catch (error) {
    throw new Error(`Blog generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Action: Generate Blog Post with AI
export const generateBlogPost = action({
  args: {
    topic: v.string(),
    targetAudience: v.string(),
    contentType: v.string(),
    technicalLevel: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    generateImage: v.optional(v.boolean()),
    imageStyle: v.optional(v.string()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const { topic, targetAudience, contentType, technicalLevel, keywords, generateImage, imageStyle, locale } = args;

    try {
      const generatedContent = await generateBlogContent({
        topic,
        targetAudience,
        contentType,
        technicalLevel: technicalLevel || 'intermediate',
        keywords: keywords || [topic.toLowerCase()],
        locale: locale || 'en',
        wordCount: 1000,
      });

      const response = {
        ...generatedContent,
        seoScore: 85, // Would be calculated based on content analysis
        generatedAt: Date.now(),
        generationTime: Date.now() - startTime,
        model: getAvailableModel(initializeAIModels()).name,
        imageGenerated: generateImage || false,
        imageStyle: imageStyle || 'professional',
      };

      return response;
    } catch (error) {
      // Return fallback response on error
      return {
        title: {
          en: `${topic}: A Comprehensive Guide`,
          fr: `${topic}: Un Guide Complet`,
        },
        content: {
          en: `This is a placeholder blog post about ${topic} for ${targetAudience}. The AI generation system encountered an issue.`,
          fr: `Ceci est un article de blog placeholder sur ${topic} pour ${targetAudience}. Le système de génération IA a rencontré un problème.`,
        },
        excerpt: {
          en: `Learn about ${topic}`,
          fr: `Apprenez sur ${topic}`,
        },
        tags: keywords || [topic.toLowerCase()],
        seoMetaDescription: {
          en: `Guide to ${topic}`,
          fr: `Guide de ${topic}`,
        },
        seoScore: 70,
        readTime: 5,
        wordCount: 500,
        generatedAt: Date.now(),
        generationTime: Date.now() - startTime,
        model: "Fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Action: Get AI Model Status
export const getAiModelStatus = action({
  args: {},
  handler: async (ctx) => {
    // This will be implemented with the AI model manager
    // For now, return a placeholder response
    
    const modelStatus = {
      models: [
        {
          id: "gemini-2.5-flash",
          name: "Gemini 2.5 Flash",
          provider: "gemini",
          isAvailable: true,
          quotaUsed: 150,
          quotaLimit: 2000,
          priority: 1,
          lastError: null,
        },
        {
          id: "placeholder-local",
          name: "Local Fallback",
          provider: "local",
          isAvailable: true,
          quotaUsed: 0,
          quotaLimit: 999999,
          priority: 10,
          lastError: null,
        },
      ],
      activeModel: "gemini-2.5-flash",
      totalRequests: 150,
      successRate: 98.5,
      averageResponseTime: 1200,
      timestamp: Date.now(),
    };

    return modelStatus;
  },
});

// Action: Generate Topic Suggestions
export const generateTopicSuggestions = action({
  args: {
    category: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    count: v.optional(v.number()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This will be implemented with the AI model manager
    // For now, return placeholder suggestions
    
    const { category, targetAudience, count, locale } = args;
    const suggestionCount = count || 10;
    
    const topics = [
      "Modern React Patterns and Best Practices",
      "Building Scalable Node.js Applications",
      "TypeScript Advanced Features and Use Cases",
      "Next.js 15 New Features and Migration Guide",
      "Database Design Principles for Web Applications",
      "API Security Best Practices",
      "Performance Optimization Techniques",
      "Microservices Architecture Patterns",
      "DevOps and CI/CD Pipeline Setup",
      "Cloud Computing Fundamentals",
    ].slice(0, suggestionCount);

    return {
      topics,
      category: category || "web-development",
      targetAudience: targetAudience || "developers",
      count: topics.length,
      timestamp: Date.now(),
      model: "placeholder",
    };
  },
});

// Action: Generate SEO Keywords
export const generateSeoKeywords = action({
  args: {
    topic: v.string(),
    count: v.optional(v.number()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This will be implemented with the AI model manager
    // For now, return placeholder keywords
    
    const { topic, count, locale } = args;
    const keywordCount = count || 20;
    
    const keywords = [
      topic.toLowerCase(),
      `${topic.toLowerCase()} tutorial`,
      `${topic.toLowerCase()} guide`,
      `${topic.toLowerCase()} best practices`,
      `${topic.toLowerCase()} examples`,
      `learn ${topic.toLowerCase()}`,
      `${topic.toLowerCase()} tips`,
      `${topic.toLowerCase()} techniques`,
      `${topic.toLowerCase()} patterns`,
      `${topic.toLowerCase()} development`,
    ].slice(0, keywordCount);

    return {
      keywords,
      topic,
      count: keywords.length,
      searchVolume: keywords.map(() => Math.floor(Math.random() * 1000) + 100),
      competition: keywords.map(() => ["low", "medium", "high"][Math.floor(Math.random() * 3)]),
      timestamp: Date.now(),
      model: "placeholder",
    };
  },
});
